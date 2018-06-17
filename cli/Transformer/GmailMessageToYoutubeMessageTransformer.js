"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const YoutubeMessage_1 = require("../Model/YoutubeMessage");
class GmailMessageToYoutubeMessageTransformer {
    transform(object) {
        const data = Buffer.from(object.payload.parts[0].body.data, "base64").toString();
        const videoId = data.match(/watch\?v=([0-9A-Za-z_-]{11})/)[1];
        return new YoutubeMessage_1.default()
            .setId(object.id)
            .setTimestamp(object.internalDate)
            .setSender(this.getHeader("From", object).match(/<([^>]+)>/)[1])
            .setTitle(this.getHeader("Subject", object))
            .setVideoId(videoId)
            .setChannel(data.substr(0, data.indexOf("just uploaded")).trim());
    }
    getHeader(name, data) {
        return data.payload.headers.find((header) => header.name === name)
            .value;
    }
}
exports.default = GmailMessageToYoutubeMessageTransformer;
//# sourceMappingURL=GmailMessageToYoutubeMessageTransformer.js.map