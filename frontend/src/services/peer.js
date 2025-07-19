class PeerService {
  constructor() {
    if (!this.peer) {
      this.peer = new RTCPeerConnection({
        iceServers: [
          {
            urls: [
              "stun:stun.l.google.com:19302",
              "stun:global.stun.twilio.com:3478",
            ],
          },          
        ],
      });

      // this.peer.onicecandidate = (event) => {
      //   if (event.candidate) {
      //     console.log("Sending ICE candidate:", event.candidate);
      //     // Emit candidate to the other peer via Socket.IO
      //     window.socket.emit("ice-candidate", {
      //       to: window.remoteSocketId, // You'll need to pass remoteSocketId
      //       candidate: event.candidate,
      //     });
      //   }
      // };
    }
  }

  // Add method to handle received ICE candidates
  async addIceCandidate(candidate) {
    if (this.peer) {
      await this.peer.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }

  async getAnswer(offer) {
    if (this.peer) {
      await this.peer.setRemoteDescription(offer);
      const ans = await this.peer.createAnswer();
      //await this.peer.setLocalDescription(new RTCSessionDescription(ans));
      await this.peer.setLocalDescription(ans); 
      return ans;
    }
  }

  async setLocalDescription(ans) {
    if (this.peer) {
      //await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
        await this.peer.setRemoteDescription(ans);
    }
  }

  async getOffer() {
    if (this.peer) {
      const offer = await this.peer.createOffer();
      //await this.peer.setLocalDescription(new RTCSessionDescription(offer));
      await this.peer.setLocalDescription(offer);

      return offer;
    }
  }
}

export default new PeerService();
