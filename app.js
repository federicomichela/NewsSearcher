const UNSPLASH_CLIENT_ID = '1dec4c6fe339f383108d3995959b86df5de6d070e1ab0077a149d800ca5b185a';
const NYTNEWS_CLIENT_ID = 'o93HBhMAC1xGaF0lj4JdgoBY3GAERZsO';

(function () {
    const form = document.querySelector('#search-form');
    const searchField = document.querySelector('#search-keyword');
    const responseContainer = document.querySelector('#response-container');

    form.addEventListener('submit', function (e) {
        let url, apiKey;

        e.preventDefault();
        responseContainer.innerHTML = '';

        // load image from search
        url = `https://api.unsplash.com/search/photos?page=1&query=${searchField.value}`;
        apiKey = `Client-ID ${UNSPLASH_CLIENT_ID}`;
        sendRequest(url, apiKey, addImage, notifyError.bind('image'));

        // load NY Time search related News
        url = `https://api.nytimes.com/svc/search/v2/articlesearch.json?q=${searchField.value}&api-key=${NYTNEWS_CLIENT_ID}`;
        sendRequest(url, null, loadNews, notifyError.bind('article'));
    });

    /**
     * Send a GET http request
     *
     * @param url {String}
     * @param apiKey {String}
     * @param onSuccess {Function}
     * @param onError {Function}
     */
    const sendRequest = (url, apiKey, onSuccess, onError) => {
        const unsplashRequest = new XMLHttpRequest();

        unsplashRequest.onload = onSuccess;
        unsplashRequest.onerror = onError;
        unsplashRequest.open('GET', url);

        if (apiKey) {
            unsplashRequest.setRequestHeader('Authorization', apiKey);
        }

        unsplashRequest.send();
    };

    /**
     * Render error message
     *
     * @param err {String}
     * @param target {String}
     */
    const notifyError = (err, target = 'service') => {
        let htmlContent = `<div class="error-no-${target}">${err}</div>`;

        responseContainer.insertAdjacentHTML('afterbegin', htmlContent);
    };

    /**
     * Render image from response object
     *
     * @param response {ProgressEvent}
     */
    const addImage = response => {
        if (response.currentTarget.status === 200) {
            const data = JSON.parse(response.currentTarget.response);
            const searchQuery = response.currentTarget.responseURL.split('query=')[1];
            const firstImage = data.results[0];
            let htmlContent = `
                <figure>
                    <img src="${firstImage.urls.regular}" alt="${searchQuery}">
                    <figcaption>${searchQuery} by ${firstImage.user.name}</figcaption>
                </figure>
            `;

            responseContainer.insertAdjacentHTML('afterbegin', htmlContent);
        } else {
            notifyError(response.currentTarget.statusText, 'image');
        }
    };

    /**
     * Render all articles from response object
     *
     * @param response {ProgressEvent}
     */
    const loadNews = response => {
        if (response.currentTarget.status === 200) {
            const data = JSON.parse(response.currentTarget.response);
            const allNews = data.response.docs;
            let htmlContent = [];

            allNews.forEach(news => htmlContent.push(getNewsArticle(news)));

            responseContainer.insertAdjacentHTML('afterend', htmlContent.join(''));
        } else {
            notifyError(response.currentTarget.statusText, 'articles');
        }
    };

    /**
     * Retrieve all keywords related to an article as a string.
     *
     * @param news {Object - https://developer.nytimes.com/docs/top-stories-product/1/types/Article}
     */
    const getArticleKeywords = news => {
        let keywordsParagraph = [];

        news.keywords.forEach(keyword => keywordsParagraph.push(keyword.value));

        return keywordsParagraph.join(', ');
    };

    /**
     * Retrive a string representing a news article in the DOM.
     *
     * @param news {Object - https://developer.nytimes.com/docs/top-stories-product/1/types/Article}
     */
    const getNewsArticle = news => {
        return `
        <article class="article">
            <h2><a href="${news.web_url}" target="_blank">${news.headline.main}</a></h2>
            <p>${news.snippet}</p>
            <p>${news.pub_date}</p>
            <p><b>Source: </b>${news.source}</p>
            <p><b>Tags: </b><span>${getArticleKeywords(news)}</span></p>
        </article>
        `;
    };
})();
