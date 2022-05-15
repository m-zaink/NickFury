// User
export interface User {
    readonly id: String;
    readonly name: String;
    readonly email: String;
    readonly username: String;
    readonly description: String;
    readonly image: String;
    readonly creationDate: String;
    readonly lastUpdatedDate: String;
    readonly socialDetails: {
        followersCount: Number;
        followingsCount: Number;
    }
    readonly activityDetails: {
        tweetsCount: Number;
    }
}

export interface UserViewables {
    following: Boolean;
}

export interface ViewableUser extends User {
    viewables: UserViewables;
}

// Session
export interface Session {
    readonly id: String;
    readonly userId: String;
    readonly creationDate: String;
}

// Follower
export interface Follower {
    readonly followerId: String;
    readonly creationDate: String;
}

export interface FollowerViewables {
    follower: ViewableUser;
}

export interface ViewableFollower {
    readonly viewables: FollowerViewables;
}

// Followee
export interface Followee {
    readonly followeeId: String;
    readonly creationDate: String;
}

export interface FolloweeViewables {
    followee: ViewableUser;
}

export interface ViewableFollowee {
    readonly viewables: FolloweeViewables;
}

// Tweet
export interface Tweet {
    readonly id: String;
    readonly complimentaryId: String;
    readonly text: String;
    readonly authorId: String;
    readonly creationDate: String;
    readonly lastUpdatedDate: String;
    readonly interactionDetails: {
        likesCount: Number;
        commentsCount: Number;
    }
}

export interface TweetViewables {
    author: ViewableUser;
    bookmarked: Boolean;
}

export interface ViewableTweet extends Tweet {
    readonly viewables: TweetViewables;
}

// Comment
export interface Comment {
    readonly id: String;
    readonly tweetId: String;
    readonly authorId: String;
    readonly text: String;
    readonly creationDate: String;
}

export interface CommentViewables {
    tweet: ViewableTweet;
    author: ViewableUser;
}

export interface ViewableComment extends Comment {
    readonly viewables: CommentViewables;
}

// Like
export interface Like {
    readonly id: String;
    readonly tweetId: String;
    readonly authorId: String;
    readonly creationDate: String;
}

export interface LikeViewables {
    tweet: ViewableTweet;
    author: ViewableUser;
}

export interface ViewableLike extends Like {
    readonly viewables: LikeViewables;
}

// Bookmark
export interface Bookmark {
    readonly id: String;
    readonly tweetId: String;
    readonly authorId: String;
    readonly creationDate: String;
}

export interface BookmarkViewables {
    tweet: ViewableTweet;
    author: ViewableUser;
}

export interface ViewableBookmark extends Bookmark {
    readonly viewables: BookmarkViewables;
}