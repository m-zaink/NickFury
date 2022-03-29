import * as uuid from 'uuid';

import { DatabaseAssistant } from "../../assistants/database/database";
import { AddTweetSuccess } from '../../assistants/stream/feeds/samaritanFeed/types';
import { StreamAssistant } from '../../assistants/stream/stream';
import { TxDatabaseCollections } from "../core/collections";
import { SamaritansManager } from "../samaritansManager/samaritansManager";
import { Tweet } from "./models";
import { CreateTweetFailure, CreateTweetSuccess, UnkownCreateTweetFailure } from "./types";

class TweetsManager {
    public static readonly shared = new TweetsManager();

    async tweet(parameters: {
        tid: String;
    }): Promise<Tweet | null> {
        const collectionRef = DatabaseAssistant.shared.collection(TxDatabaseCollections.tweets);
        const documentRef = collectionRef.doc(parameters.tid.valueOf());

        const document = await documentRef.get();

        if (document.exists) {
            const result = document.data() as unknown as Tweet;
            return result;
        } else {
            const result = null;
            return result;
        }
    }

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
                    tid: tweetCreationResult.tid.valueOf(),
                    fid: fid,
                    text: parameters.text,
                    creationDate: Date.now(),
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
                    // Let it fall through
                }
            }
        }

        const result = new UnkownCreateTweetFailure();
        return result;
    }
}