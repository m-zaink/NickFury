// Tweet
export enum TweetFailure {
    UNKNOWN,
    TWEET_DOES_NOT_EXISTS,
}

// Feed
export enum TweetsFeedFailure {
    UNKNOWN,
    AUTHOR_DOES_NOT_EXISTS,
}

// Create Tweet
export enum CreateTweetFailure {
    UNKNOWN,
    AUTHOR_DOES_NOT_EXISTS,
    MALFORMED_TWEET
}

// Delete Tweet
export enum DeleteTweetFailure {
    UNKNOWN,
    TWEET_DOES_NOT_EXISTS,
}


// Viewable
export enum ViewableTweetFailure {
    UNKNOWN,
    VIEWER_DOES_NOT_EXISTS
}

// Viewable Feed
export enum ViewableTweetFeedFailure {
    UNKNOWN,
    VIEWER_DOES_NOT_EXISTS
}