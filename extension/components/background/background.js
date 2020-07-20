
const CONFIG = Object.freeze({
    query_results_html_file_path: '/components/query_results_page/query_results_page.html',
    query_results_page_injected_content_script_path: '/components/content_scripts/query_results_page_injected.js',
    native_application_name: 'ocr_web',
    query_timeout_ms: 5000,
    screenshot_interval_ms: 10000
});

let request_id_counter = 0;

const PORT = browser.runtime.connectNative(CONFIG.native_application_name);

PORT.onDisconnect.addListener(port => {
    console.log('port disconnected');
    if (port.error) {
        console.error(port.error);
    }
});


window.setInterval(async () => {
    try {
        const current_tab = (await browser.tabs.query({active: true, lastFocusedWindow: true}))[0];
        const base64_img_data = (await browser.tabs.captureVisibleTab()).split(',')[1];

        PORT.postMessage({
            type: 'add',
            request_id: request_id_counter++,
            url: current_tab.url,
            title: current_tab.title,
            base64_img_data,
            timestamp_ms: Date.now()
        });
    } catch (err) {
        console.error(err);
    }
}, CONFIG.screenshot_interval_ms);

async function handle_message(message) {
    const {message_type} = message;

    switch (message_type) {
        case 'query': {
            const request_id = request_id_counter++;

            PORT.postMessage({type: 'query', request_id, query: message.query});

            const response = await new Promise((resolve, reject) => {
                function obtain_response(response) {
                    if (response.request_id  === request_id) {
                        PORT.onMessage.removeListener(obtain_response);
                        resolve(response)
                    }
                }

                setTimeout(() => {
                    PORT.onMessage.removeListener(obtain_response);
                    reject(`Timed out after ${CONFIG.query_timeout_ms} milliseconds.`);
                }, CONFIG.query_timeout_ms);

                PORT.onMessage.addListener(obtain_response);
            });

            const extension_tab = await browser.tabs.create({url: CONFIG.query_results_html_file_path});
            await browser.tabs.executeScript(extension_tab.id, {file: CONFIG.query_results_page_injected_content_script_path});
            await browser.tabs.sendMessage(extension_tab.id, {entries: response.entries, query: message.query});

            break;
        }
        default: {
            return void console.error(browser.i18n.getMessage('unsupported_message_type', message_type));
        }
    }
}

browser.runtime.onMessage.addListener(handle_message);
