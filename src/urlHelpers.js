
export function isUrl(urlString) {
    const urlParts = this.splitUrl(urlString);
    if (urlParts[0] === 'http:' || urlParts[0] === 'https:') {
        return true;
    }
}

export function isSearchUrl(urlString) {
    const urlParts = this.splitUrl(urlString);
    if (urlParts[0] === '' && ((urlParts[1] === 'url?q=https:' || urlParts[1] === 'url?q=http:'))) {
        return true;
    }
}

export function isRedirectUrl(urlString) {
    const urlParts = this.splitUrl(urlString);
    if (urlParts[0] === '') {
        return true;
    }
}


export function cleanSearchUrl(urlString) {
    console.log("--------------------");
    console.log("Cleaning Search URL: " + urlString);

    // Create an anchor element to use the browser's built-in URL parsing.
    const a = document.createElement('a');
    a.href = urlString;
    
    // Search parameters are everything after '?' in the URL.
    const searchParams = new URLSearchParams(a.search);
    
    // Google's redirect URL parameters to remove.
    const googleParams = ['sa', 'ved', 'usg'];
    
    // Remove Google's redirect URL parameters.
    googleParams.forEach(param => searchParams.delete(param));
    
    // Reconstruct the URL without the Google redirect parameters.
    let cleanUrl = a.origin + a.pathname;
    if (searchParams.toString()) {
        cleanUrl += '?' + searchParams.toString();
    }
    
    // Decode URL-encoded characters.
    cleanUrl = decodeURIComponent(cleanUrl);

    // Remove the localhost:3000 prefix
    cleanUrl = cleanUrl.replace(/^http:\/\/localhost:3000\/url\?q=/, '');
    // cleanUrl = cleanUrl.replace(/^http:\/\/localhost:3000/, '');
    console.log("Cleaned Search URL: " + cleanUrl);
    console.log("--------------------");
    return cleanUrl;
} 

export function cleanRedirectUrl(urlString) {
    console.log("[REDIRECT CLEANING]");
    console.log("--------------------");
    console.log("Cleaning Redirect URL: " + urlString);
    let baseUrl = this.state.url;
    console.log("Current URL: " + baseUrl);
    const redirectParts = this.splitUrl(urlString);
    const urlParts = this.splitUrl(baseUrl);

    for (let redirectID = 1; redirectID < redirectParts.length; redirectID++) {
        for (let urlID = 1; urlID < urlParts.length; urlID++) {
            if (redirectParts[redirectID] === urlParts[urlID]) {
                const baseUrlParts = urlParts.slice(0, urlID);
                console.log("Base URL Parts: " + baseUrlParts);
                baseUrl = baseUrlParts.join('/');
                baseUrl += urlString;
                console.log("Cleaned Redirect URL: " + baseUrl);
                console.log("--------------------");
                return baseUrl;      
            }
        }
    }

    // that means we didn't find a match, so lets just append the redirect url to the current url
    baseUrl += urlString;
    console.log("Cleaned Redirect URL: " + baseUrl);
    console.log("--------------------");
    return baseUrl;

    // throw new Error('Failed to clean redirect URL');  
}






// splits a path by '/' and returns an array of the parts
export function splitPath(urlString) {
    return urlString.split('/');
}

// 

export function getSearchInputType(inputString) {
    const inputCharArray = inputString.split('');

    // checks if input is a query
    if ((inputCharArray[0] !== '/')) {
        return 'IS_QUERY';
    }

    // if not a query, then we handle it as a path
    const pathArray = splitPath(inputString);
    if (pathArray[0] === 'http:' || pathArray[0] === 'https:') {
        return 'IS_URL';
    } 
    else if (pathArray[0] === '' && ((pathArray[1] === 'url?q=https:' || pathArray[1] === 'url?q=http:'))) {
        return 'IS_SEARCH_URL';
    } 
    else {
        return 'unknown';
    }
}

export function getCleanURL(inputString) {
    const inputType = getSearchInputType(inputString);
    if (inputType === 'IS_QUERY') {
        console.log("[NEW QUERY] : " + inputString)
        return `https://www.google.com/search?q=${inputString}`;
    }
    else if (inputType === 'IS_URL') {
        console.log("[NEW URL] : " + inputString)
        return inputString;
    }
    else if (inputType === 'IS_SEARCH_URL') {
        console.log("[NEW SEARCH URL] : " + inputString)
        return cleanSearchUrl(inputString);
    }
    else {
        throw new Error('Failed to get clean URL');
    }
}