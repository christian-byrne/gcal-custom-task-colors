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
        background-color: ${hexToRgba(value, 0.24)} !important;
        color:rgba(8, 8, 8, .78) !important;
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
    fetch(chrome.runtime.getURL("user-data/color-map.js"))
      .then((response) => response.json())
      .then((data) => {
        const styleEl = document.createElement("style");
        styleEl.textContent = mapUserColorsToCss(data);
        document.head.appendChild(styleEl);
      })
      .catch((err) => {
        console.error("Error loading color map", err);
      });
    const coursesWithLabels = [...Object.keys(taskColorMappings)];

    // Initial (tasks are loaded asynchronously after short delay)
    setTimeout(() => {
      addColorClassesToElements(coursesWithLabels);
    }, 800);

    // Update every 2.4 seconds
    setInterval(function () {
      addColorClassesToElements(coursesWithLabels);
    }, 2400);
  });
}, 600);
