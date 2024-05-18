Set custom colors for GCal tasks and events. Custom colors match to keywords in the event/task name so you don't have to set the color manually whenever you create an event/task. Just add the key name in the event/task name somewhere. Set key/values in order of precedence/priority for subcategories.

Speed could be improved. Please PR or use however you want.


![example pic](wiki/Selection_007.png)

## Installation

#### Using a JS Injector Extension/Tool/Script

1. Edit the attributes of `customColorMappings` in [js-injector-version.js](./js-injection-version.js) 
2. Copy and paste code in [js-injector-version.js](./js-injection-version.js) into your JS Injector Extension/Tool/Script

#### As a Chrome Extension

1. Set key/values of color map in [user-data/color-map.json](./user-data/color-map.json)
   ```json
    {
      "Daily": "#BEBDBF",
      "Fitness": "#546E7A",
      "Pets": "#546E7A",
      "Housework": "#546E7A",
      "Maintenance": "#546E7A",
      "Side Hustle": "#546E7A",
      "Kids": "#607D8B",
      "Work": "#F24162",
      "Research": "#1BBC9B",
      "Job Search": "#BEDB39",
      "Wellness": "#5C148C",
      "Appointments": "#1BBC9B",
      "Family": "#ebd722"
    }
      ```
2. Go to url `chrome://extensions/`
3. Enable `Developer mode` on that page
4. `Load unpacked` and select this code's install directory
      