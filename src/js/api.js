class Api {
  constructor() {
    this.handlers = new Map()
    this.tries = 0;

    this.on = (type, handler) => {
      if (!this.handlers.has(type)) this.handlers.set(type, [])
      this.handlers.get(type).push(handler)
    }

    this.send = (type, data) =>
      this.ws.send(JSON.stringify({ type, data }));

    this.killed = false;
    this.conect();
  }

  conect() {
    this.ws = new WebSocket("ws://localhost:8081");
    this.disconnect = () => this.ws.close();

    this.ws.onopen = () => {
      //console.clear();
      console.log('WebSocket is open now');
      this.tries = 0;
      clearInterval(this.reconnect);
      if (this.handlers.has('ws://online'))
        this.handlers.get('ws://online').forEach(handler => handler());
    }

    this.ws.onclose = () => {
      console.log('WebSocket is closed now');
      if (this.killed) return;

      this.reconnect = setInterval(() => {
        if (this.tries < 3) {
          this.tries++;
          this.conect();
          console.log('Trying to reconnect');
        }
        else {
          console.log('Im dead');
          clearInterval(this.reconnect);
          if (this.handlers.has('ws://offline'))
            this.handlers.get('ws://offline').forEach(handler => handler());
        }
      }, 1000);
    }

    this.ws.onerror = () => {
      console.log('Some sort of error in WebSocket');
      clearInterval(this.reconnect);
    }

    this.ws.onmessage = (event) => {
      let data = JSON.parse(event.data);
      console.log('Got message type ' + data.type);
      if (this.handlers.has(data.type))
        this.handlers.get(data.type).forEach(handler => handler(data.data));
      else {
        console.log('Unknown type of event: ' + data.type);
        console.log(data.data);
      }
    }
  }

}

export const api = new Api();
