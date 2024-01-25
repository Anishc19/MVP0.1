import React, { Component } from 'react';
import * as urlHelpers from './urlHelpers';

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

    handleDocumentClick = (event) => {
        // Traverse up to find the closest anchor tag if the target is not the anchor itself
        let element = event.target;
        while (element != null && element.tagName !== 'A') {
          element = element.parentElement;
        }
      
        // If an anchor tag was clicked, prevent the default action
        if (element && element.tagName === 'A') {
            event.preventDefault();
            let clickedString = element.getAttribute('href');
            console.log("*(Raw User clicked): ", clickedString);
            this.setPageContent(clickedString);
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
            this.setPageContent(this.state.url);
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
            this.setPageContent(this.state.url);
        });
    };

    handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            this.setPageContent(this.state.url);
        }
    };


    setPageContent = async (inputString) => {
        try {
            let cleanedURL = urlHelpers.getCleanURL(inputString);


            this.setState(
                prevState => ({searchHistory: [...prevState.searchHistory, cleanedURL]}),
            );
            this.state.url = cleanedURL;

            const response = await fetch(
                'http://localhost:3001/proxy', 
                {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ url: cleanedURL }),
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Retrieve the text of the response immediately
            const data = await response.text();

            try {
                data  = <iframe src={cleanedURL} frameborder="0" style={{ width: '100%', height: '100vh' }} />
                console.log("IFRAME ALLOWED for " + cleanedURL);
                // this.setState({ content: data });
            }
            catch (error) {
                // this.setState({ content: data });
                console.log("IFRAME NOT ALLOWED for " + cleanedURL);
            }


            this.setState({ content: data });

            // // Check for the custom X-IFrame-Allowed header in the response
            // // const iframeAllowed = response.headers.get('X-IFrame-Allowed') === 'true';
            // // Replace your existing iframe check with this new check
            // const iframeEmbeddable = response.headers.get('X-Content-Embeddable') === 'true';
            // if (iframeEmbeddable) {
            //     // If embedding the content in an iframe is allowed
            //     console.log("IFRAME ALLOWED for " + cleanedURL);
            //     this.setState({ 
            //         content: `<iframe src="${cleanedURL}" frameborder="0" style="width:100%;height:100vh;"></iframe>` 
            //     });
            // } else {
            //     console.log("IFRAME NOT ALLOWED for " + cleanedURL);
            //     // If not, display the fetched HTML content
            //     this.setState({ content: data });
            // }            
            
            // Print out the search history
            console.log("|||| Search History ||||");
            console.log(this.state.searchHistory);
            console.log("--------------------");
            console.log("Current State URL: " + this.state.url);
            console.log("--------------------");
            
            // this.setState({ content: data });

        } 
        catch (error) {
            console.error('Fetch error:', error);
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
                        <button onClick={() => this.setPageContent(url)}>Fetch Content</button>
                        <button onClick={this.goBack}>Back</button>
                        <button onClick={this.goForward}>Forward</button>
                        <button onClick={() => this.setPageContent(url)}>Refresh</button>
                    </div>
                </div>
                    <div> <iframe src={url} frameborder="0" style={{ width: '100%', height: '100vh' }} /> </div>
                    <div> URL:  {url}</div>
                    <div id="content-display" style={{ paddingTop: '50px' }} dangerouslySetInnerHTML={{ __html: content }} />
                {/* <div> {url} </div> */}
            </div>
        );
    }
    
    
}

export default ContentFetcher;
