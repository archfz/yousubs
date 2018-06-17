"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class YoutubeMessage {
    getTimestamp() {
        return this.timestamp;
    }
    setTimestamp(value) {
        this.timestamp = value;
        return this;
    }
    getId() {
        return this.id;
    }
    setId(value) {
        this.id = value;
        return this;
    }
    getUrl() {
        return this.videoId;
    }
    setVideoId(value) {
        this.videoId = value;
        return this;
    }
    getTitle() {
        return this.title;
    }
    setTitle(value) {
        this.title = value;
        return this;
    }
    getChannel() {
        return this.channel;
    }
    setChannel(value) {
        this.channel = value;
        return this;
    }
    getSender() {
        return this.sender;
    }
    setSender(value) {
        this.sender = value;
        return this;
    }
}
exports.default = YoutubeMessage;
//# sourceMappingURL=YoutubeMessage.js.map