const search_input = document.querySelector('.search-input');
const search_button = document.querySelector('.search-button');

search_button.addEventListener('click', () => {
    browser.runtime.sendMessage({message_type: 'query', query: search_input.value}).catch(err => console.error(err));
    window.close();
});

search_button.disabled = false;
