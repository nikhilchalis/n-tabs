document.addEventListener("DOMContentLoaded", () => {
    const tabsList = document.getElementById("tabs-list");
    const savedTabsList = document.getElementById("saved-tabs-list");

    // Get all open tabs
    chrome.tabs.query({}, (tabs) => {
        tabs.forEach(async (tab) => {
            // Create a list item for each tab
            const listItem = document.createElement("li");
            const link = document.createElement("a");
            link.href = tab.url;
            link.target = "_blank"; // Open the link in a new tab

            // Extract the website name from the URL
            const url = new URL(tab.url);
            const websiteName = url.hostname.replace(/^www\./, '');
            link.textContent = websiteName;

            // Add a dummy icon to the link
            const iconImg = document.createElement("img");
            iconImg.src = chrome.runtime.getURL("icon.png");
            iconImg.width = 20;
            iconImg.height = 20;
            iconImg.style.marginRight = "8px";
            iconImg.style.marginBottom = "-5px";
            link.prepend(iconImg);

            // Inject a content script to extract the title
            setTimeout(() => {
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    chrome.scripting.executeScript({
                        target: { tabId: tabs[0].id },
                        function: () => {
                            const titleElement = document.querySelector('yt-formatted-string');
                            const titleText = titleElement.textContent;
                            return titleText;
                        }
                    }, (result) => {
                        const titleText = result[0].result;
                        console.log(titleText);
                    });
                });
            }, 1000);

            listItem.appendChild(link);
            tabsList.appendChild(listItem);
        });

        // Get all link containers
        const linkContainers = document.querySelectorAll('#tabs-list li');

        // Add event listeners for mouseover and mouseout
        linkContainers.forEach((container) => {
            let icon;

            container.addEventListener('mouseover', (e) => {
                console.log('mouseover')
                // Check if the icon element already exists
                if (!icon) {
                    // Create the icon element
                    icon = document.createElement('img');
                    icon.src = chrome.runtime.getURL('save.png');
                    icon.width = 14;
                    icon.height = 16;
                    icon.className = 'hover-icon';

                    // Append the icon to the container
                    container.appendChild(icon);

                    // Add an event listener to the save icon
                    icon.addEventListener('click', (e) => {
                        console.log('clicked')
                        // Get the URL of the tab
                        const url = container.querySelector('a').href;

                        // Create a new list item for the saved tab
                        const savedListItem = document.createElement("li");
                        const savedLink = document.createElement("a");
                        savedLink.href = url;
                        savedLink.target = "_blank"; // Open the link in a new tab
                        savedLink.textContent = container.querySelector('a').textContent;

                        savedListItem.appendChild(savedLink);
                        savedTabsList.appendChild(savedListItem);
                    });
                }
            });

            container.addEventListener('mouseout', (e) => {
                setTimeout(() => {
                    console.log('mouseout')
                    // Remove the icon from the container
                    if (icon) {
                        icon.remove();
                        icon = null;
                    }
                }, 100);
            });
        });
    });
});
