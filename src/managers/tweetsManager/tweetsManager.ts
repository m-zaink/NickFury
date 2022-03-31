import * as uuid from 'uuid';

import { DatabaseAssistant } from "../../assistants/database/database";
import { AddTweetSuccess, RemoveTweetSuccess } from '../../assistants/stream/feeds/samaritanFeed/types';
import { StreamAssistant } from '../../assistants/stream/stream';
import { Dately } from '../../utils/dately/dately';
import { TxDatabaseCollections } from "../core/collections";
import { SamaritansManager } from "../samaritansManager/samaritansManager";
import { EnrichedTweet, Tweet } from "./models";
import { CreateTweetFailure, CreateTweetSuccess, DeleteTweetFailure, DeleteTweetSuccess, Feed, UnknownDeleteTweetFailure, UnkownCreateTweetFailure } from "./types";

export class TweetsManager {
    public static readonly shared = new TweetsManager();
    
    async createTweet(parameters: {
        text: String;
        sid: String;
    }): Promise<CreateTweetSuccess | CreateTweetFailure> {
        const isSamaritanPresent = await SamaritansManager.shared.exists({
            sid: parameters.sid
        });

        if (isSamaritanPresent) {
            const fid = uuid.v4();

            const tweetCreationResult = await StreamAssistant
                .shared
                .samaritanFeed
                .addTweet({
                    fid: fid,
                    sid: parameters.sid,
                });

            if (tweetCreationResult instanceof AddTweetSuccess) {
                const tweet: Tweet = {
                    tweetId: tweetCreationResult.tid.valueOf(),
                    foreignId: fid,
                    text: parameters.text,
                    creationDate: Dately.shared.now(),
                    authorSid: parameters.sid.valueOf(),
                    meta: {
                        likesCount: 0
                    },
                };

                const collectionRef = DatabaseAssistant.shared.collection(TxDatabaseCollections.tweets);
                const documentRef = collectionRef.doc(tweetCreationResult.tid.valueOf());

                try {
                    await documentRef.create(tweet);

                    const result = new CreateTweetSuccess({
                        tweet: tweet
                    });
                    return result;
                } catch {
                    const result = new UnkownCreateTweetFailure();
                    return result;
                }
            }
        }

        const result = new UnkownCreateTweetFailure();
        return result;
    }

    async deleteTweet(parameters: {
        tweetId: String;
        samaritanId: String;
    }): Promise<DeleteTweetSuccess | DeleteTweetFailure> {
        const isSamaritanPresent = await SamaritansManager.shared.exists({
            sid: parameters.samaritanId
        });

        if (isSamaritanPresent) {
            const remoteTweetResult = await StreamAssistant.shared.samaritanFeed.removeTweet({
                samaritanId: parameters.samaritanId,
                tweetId: parameters.tweetId
            });

            if (remoteTweetResult instanceof RemoveTweetSuccess) {
                // Not deleting tweet from DB.
                // Data might be useful later on.
                const result = new DeleteTweetSuccess();
                return result;
            }
        }

        const result = new UnknownDeleteTweetFailure();
        return result;
    }

    async tweet(parameters: {
        tweetId: String;
        enriched?: Boolean;
    }): Promise<Tweet | EnrichedTweet | null> {
        const result = null;
        return result;
    }
}