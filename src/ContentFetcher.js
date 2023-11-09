import React, { Component } from 'react';

class ContentFetcher extends Component {
    constructor(props) {
        super(props);
        this.state = {
            url: '',
            content: '',
            searchHistory: [], // Added to store the history of searches
            historyIndex: -1 // Added to keep track of the current index in the search history
    };

    }

    // Called immediately after a component is mounted. Setting state here will trigger re-rendering.
    componentDidMount() {
        document.addEventListener('click', this.handleDocumentClick);
    }


    // Called immediately before a component is destroyed. Perform any necessary cleanup in this method, such as cancelled network requests, or cleaning up any DOM elements created in componentDidMount.
    componentWillUnmount() {
        // Clean up the event listener when the component unmounts
        this.removeClickListener();

        document.removeEventListener('click', this.handleDocumentClick);
    }

    

    attachClickListener = () => {
        const contentDiv = document.getElementById('content-display');
        if (contentDiv) {
            contentDiv.addEventListener('click', this.handleDocumentClick);
        }
    };

    removeClickListener = () => {
        const contentDiv = document.getElementById('content-display');
        if (contentDiv) {
            contentDiv.removeEventListener('click', this.handleDocumentClick);
        }
    };

    splitUrl(urlString) {
        return urlString.split('/');
    }

    isUrl(urlString) {
        const urlParts = this.splitUrl(urlString);
        if (urlParts[0] === 'http:' || urlParts[0] === 'https:') {
            return true;
        }
    }

    isSearchUrl(urlString) {
        const urlParts = this.splitUrl(urlString);
        if (urlParts[0] === '' && ((urlParts[1] === 'url?q=https:' || urlParts[1] === 'url?q=http:'))) {
            return true;
        }
    }

    isRedirectUrl(urlString) {
        const urlParts = this.splitUrl(urlString);
        if (urlParts[0] === '') {
            return true;
        }
    }


    cleanSearchUrl(urlString) {
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
    
    cleanRedirectUrl(urlString) {
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


    handleDocumentClick = (event) => {
        // Traverse up to find the closest anchor tag if the target is not the anchor itself
        let element = event.target;
        while (element != null && element.tagName !== 'A') {
          element = element.parentElement;
        }
      
        // If an anchor tag was clicked, prevent the default action
        if (element && element.tagName === 'A') {
            event.preventDefault();
            let newUrl = element.getAttribute('href');
            // console.log("Link clicked:",newUrl);
            // console.log(this.splitUrl(newUrl));
            if (this.isSearchUrl(newUrl)) {
                newUrl = this.cleanSearchUrl(newUrl);
                console.log("Link clicked:",newUrl);
            }
            else if (this.isRedirectUrl(newUrl)) {
                newUrl = this.cleanRedirectUrl(newUrl);
                console.log("Link clicked:",newUrl);
            }


            this.setState({ url: newUrl }, () => {
                this.fetchContent(newUrl);
            });

        //   this.setState({ url: newUrl });
        }
    };

    handleInputChange = (event) => {
        this.setState({ url: event.target.value });
    };


    goBack = () => {
        this.setState(prevState => {
            const newHistoryIndex = Math.max(prevState.historyIndex - 1, 0);
            return {
                historyIndex: newHistoryIndex,
                url: prevState.searchHistory[newHistoryIndex] || '',
            };
        }, () => {
            this.fetchContent(this.state.url);
        });
    };

    goForward = () => {
        this.setState(prevState => {
            const newHistoryIndex = Math.min(prevState.historyIndex + 1, prevState.searchHistory.length - 1);
            return {
                historyIndex: newHistoryIndex,
                url: prevState.searchHistory[newHistoryIndex] || '',
            };
        }, () => {
            this.fetchContent(this.state.url);
        });
    };


    fetchContent = async (fetchUrl) => {
        try {

            // Set up dat url
            let fullUrl = fetchUrl;
            if (!this.isUrl(fetchUrl)) {
                fullUrl = `https://www.google.com/search?q=${fetchUrl}`;
            }
            
            // let fullUrl = fetchUrl.startsWith('https') ? fetchUrl : `https://www.google.com/search?q=${fetchUrl}`;
            console.log("[NEW SEARCH] " + fullUrl);

            // Store dat url in da search history
            this.setState(
                prevState => ({searchHistory: [...prevState.searchHistory, fullUrl]})
            );

            const response = await fetch(
                'http://localhost:3001/proxy', 
                {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ url: fullUrl }),
                }
            );
            
            // Print out the search history
            console.log("Search History: ");
            console.log(this.state.searchHistory);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.text();
            
            this.setState({ content: data });

        } 
        catch (error) {
            console.error('Fetch error:', error);
        } 
    };

    handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            this.fetchContent(this.state.url);
        }
    };


    render() {
        const { url, content } = this.state;
    
        return (
            <div>
                {/* Use flexbox for the container */}
                <div style={{ 
                    position: 'fixed', 
                    top: 0, 
                    left: 0, 
                    right: 0, 
                    display: 'flex', 
                    alignItems: 'center', 
                    background: 'white', 
                    zIndex: 1000 
                }}>
                    {/* Flex-grow property will allow the input to expand */}
                    <input
                        type="text"
                        value={url}
                        onChange={this.handleInputChange}
                        onKeyDown={this.handleKeyDown}
                        placeholder="Enter URL or Search Query"
                        style={{ flexGrow: 1, margin: '0 5px' }} // Added styles
                    />
                    {/* Wrap buttons in a div to prevent them from growing */}
                    <div style={{ display: 'flex', flexShrink: 0 }}>
                        <button onClick={() => this.fetchContent(url)}>Fetch Content</button>
                        <button onClick={this.goBack}>Back</button>
                        <button onClick={this.goForward}>Forward</button>
                        <button onClick={() => this.fetchContent(url)}>Refresh</button>
                    </div>
                </div>
                <div id="content-display" style={{ paddingTop: '50px' }} dangerouslySetInnerHTML={{ __html: content }} />
            </div>
        );
    }
    
    
}

export default ContentFetcher;
