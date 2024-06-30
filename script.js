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

function mapUserColorsToCss(userConfig) {
  let cssString = "";
  for (let [key, options] of Object.entries(userConfig.colormap)) {
    const formattedClassName = userDictKeyToClassName(key);
    let value;
    if (userConfig.useGradient && options.secondaryColor) {
      value = twoColorsToGradient(options.color, options.secondaryColor);
    } else {
      value = options.color;
    }
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
          userConfig.completedOpacity
        )} !important;
        color:rgba(8, 8, 8, ${
          parseFloat(userConfig.completedOpacity) + 0.04
        }) !important;
        text-decoration: line-through !important;
      }
    `;
  }
  return cssString;
}

function addColorClassesToElements(tagList, userConfig) {
  const questions = document.querySelectorAll('div[role="presentation"]');
  for (let day of questions) {
    let taskElements = day.querySelectorAll("span");
    for (let el of taskElements) {
      let parent1 = el.parentElement;
      if (!parent1) {
        continue;
      }
      let parent2 = el.parentElement.parentElement;
      for (let tagName of tagList) {
        const regex = new RegExp(tagName, "i");
        if (regex.test(el.innerText)) {
          el.style.backgroundColor = "rgba(0, 0, 0, 0)";
          if (
            !Array.from(parent2.classList).some((c) =>
              c.includes("custom-taskcolor-")
            )
          ) {
            parent1.classList.add(
              `custom-taskcolor-${userDictKeyToClassName(tagName)}`
            );
            if (userConfig?.useIcons) {
              // Check if icons already exist
              if (!parent2.querySelector("#customIcon")) {
                const icon = Object.assign(document.createElement("span"), {
                  innerHTML: userConfig.colormap[tagName].icon,
                  style: "margin-right: 5px; float: right;",
                  id: "customIcon",
                });
                // Remove the default checkmark icon.
                if (parent1.querySelector("svg")) {
                  const svg = parent1.querySelector("svg");
                  svg.remove();
                }
                parent1.prepend(icon);
              }
            }
            break;
          }
        }
      }
    }
  }
}

async function getOptions() {
  let options = await chrome.storage.sync.get("taskColorConfig");
  if (!options?.taskColorConfig) {
    let old = await fetch(chrome.runtime.getURL("user-data/color-map.json"));
    return convertLegacyOptions(await old.json());
  }
  return options.taskColorConfig;
}

const defaultData = {
  colormap: {},
  refreshInterval: 1,
  useIcons: false,
  useGradient: false,
  strikethroughCompleted: true,
  completedOpacity: 0.22,
};
function convertLegacyOptions(legacyOptions) {
  let newOptions = { ...defaultData };

  for (let [key, value] of Object.entries(legacyOptions)) {
    newOptions.colormap[key] = {
      color: value,
      secondaryColor: value,
      icon: "",
      blinkWhenClose: false,
    };
  }
  return newOptions;
}

function validateData(data) {
  for (let [key, value] of Object.entries(defaultData)) {
    if (!Object.keys(data).includes(key)) {
      data[key] = value;
    } else if (typeof data[key] !== typeof value) {
      try {
        data[key] = value.constructor(data[key]);
      } catch (e) {
        console.error("Error converting value for", key, value, data[key]);
        data[key] = value;
      }
    }
  }
}

function twoColorsToGradient(color1, color2) {
  return `linear-gradient(to right, ${color1}, ${color2})`;
}

setTimeout(function () {
  window.addEventListener("load", function () {
    getOptions()
      .then((data) => {
        if (typeof data === "string") {
          data = JSON.parse(data);
        }
        validateData(data);

        const tagConfig = data.colormap;
        const directColorMap = {};
        for (let [key, value] of Object.entries(tagConfig)) {
          directColorMap[key] = value.color;
        }
        // Seconds to milliseconds.
        let refreshInterval = data.refreshInterval * 1000;
        if (!refreshInterval || isNaN(refreshInterval)) {
          refreshInterval = 2400;
        }
        refreshInterval = Math.max(refreshInterval, 200);

        const styleEl = document.createElement("style");
        styleEl.textContent = mapUserColorsToCss(data);
        document.head.appendChild(styleEl);
        const tags = [...Object.keys(tagConfig)];

        // Initial tasks are loaded asynchronously after short delay
        setTimeout(() => {
          addColorClassesToElements(tags, data);
        }, 800);

        // Update after every refreshInterval seconds.
        setInterval(function () {
          addColorClassesToElements(tags, data);
        }, refreshInterval || 2400);
      })
      .catch((err) => {
        console.error("Gcal Custom Task Colors: Error loading color map", err);
      });
  });
}, 600);
