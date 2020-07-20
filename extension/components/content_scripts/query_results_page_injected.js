import {html, render} from 'lit-html';
import {repeat} from 'lit-html/directives/repeat';

const EntryTemplate = (screenshot_src, title, url, timestamp_ms) => {
    return html`
        <div class="entry">
            <div class="entry__screenshot_container">
                <img src="${screenshot_src}" class="entry__screenshot"/>
            </div>
            <div class="entry__text_container">
                <span class="entry__title">${title}</span>
                <a class="entry__url" href="${url}">${url}</a>
                <span class="entry__datetime">${new Date(timestamp_ms)}</span>
            </div>
        </div>
    `;
};

(() => {
    return new Promise(async resolve => {
        const {entries, query} = await new Promise((resolve_message, reject) => {
            function accept_message(message) {
                browser.runtime.onMessage.removeListener(accept_message);
                resolve_message(message);
            }

            setTimeout(() => {
                browser.runtime.onMessage.removeListener(accept_message);
                reject(`Timed out after ${10000} milliseconds.`);
            }, 10000);

            browser.runtime.onMessage.addListener(accept_message);

            resolve();
        });

        document.querySelector('.search-query-text').appendChild(document.createTextNode(query));
        document.querySelector('.num-search-results').appendChild(document.createTextNode(String(entries.length)));

        render(
            repeat(
                entries,
                entry => `${entry.timestamp_ms}_${entry.url}`,
                entry => EntryTemplate(entry.screenshot_src, entry.title, entry.url, entry.timestamp_ms)
            ),
            document.querySelector('.grid-container')
        );
    });
})();
