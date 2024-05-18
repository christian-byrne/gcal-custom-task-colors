const completedItemBgOpacity = 0.22;
const completedItemTextOpacity = 0.18;

function hexToRgba(hex, alpha) {
  hex = hex.replace("#", "");

  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function userDictKeyToClassName(key) {
  return key.replace(/\s+/g, "-").toLowerCase();
}

function mapUserColorsToCss(userDict) {
  let cssString = "";
  for (let [key, value] of Object.entries(userDict)) {
    const formattedClassName = userDictKeyToClassName(key);
    cssString += `
      /* ${formattedClassName} */
      span.custom-taskcolor-${formattedClassName}, div.custom-taskcolor-${formattedClassName} {
        background-color: ${value} !important;
      }

      /* Completed ${formattedClassName} */
      span.UflSff.custom-taskcolor-${formattedClassName}, div.UflSff.custom-taskcolor-${formattedClassName} {
        /* On completed tasks, strikethrough the text and make text dark and semi-transparent */
        background-color: ${hexToRgba(
          value,
          completedItemBgOpacity
        )} !important;
        color:rgba(8, 8, 8, ${completedItemTextOpacity}) !important;
        text-decoration: line-through !important;
      }
    `;
  }
  return cssString;
}

function addColorClassesToElements(courseArray) {
  const questions = document.querySelectorAll('div[role="presentation"]');
  for (let day of questions) {
    let taskElements = day.querySelectorAll("span");
    for (let el of taskElements) {
      let parent1 = el.parentElement;
      let parent2 = el.parentElement.parentElement;
      for (let crsName of courseArray) {
        const regex = new RegExp(crsName, "i");
        if (regex.test(el.innerText)) {
          el.style.backgroundColor = "rgba(0, 0, 0, 0)";
          if (
            !parent2.classList.contains(
              `custom-taskcolor-${userDictKeyToClassName(crsName)}`
            )
          ) {
            parent1.classList.add(
              `custom-taskcolor-${userDictKeyToClassName(crsName)}`
            );
          }
          break;
        }
      }
    }
  }
}

setTimeout(function () {
  window.addEventListener("load", function () {
    const customColorMappings = {
      Daily: "#BEBDBF",
      Fitness: "#546E7A",
      Pets: "#546E7A",
      Housework: "#546E7A",
      Maintenance: "#546E7A",
      "Side Hustle": "#546E7A",
      Kids: "#607D8B",
      Work: "#F24162",
      Research: "#1BBC9B",
      "Job Search": "#BEDB39",
      Wellness: "#5C148C",
      Appointments: "#1BBC9B",
      Family: "#ebd722",
    };

    // Improve lookup-only traversal speed
    const coursesWithLabels = [...Object.keys(customColorMappings)];

    const styleEl = document.createElement("style");
    styleEl.textContent = mapUserColorsToCss(customColorMappings);
    document.head.appendChild(styleEl);

    // Initial re-color (tasks are loaded asynchronously after short delay)
    setTimeout(function () {
      addColorClassesToElements(coursesWithLabels);
    }, 256);

    // Update every 2 seconds as tasks/events are stateful with dependency on windowsize, page format, etc.
    setInterval(function () {
      addColorClassesToElements(coursesWithLabels);
    }, 2048);
  });
}, 512);
