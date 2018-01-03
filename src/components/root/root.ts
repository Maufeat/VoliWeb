import Vue from "vue";
import Component from "vue-class-component";

import {ddragon} from "../../constants";


export interface LeagueClient {
    id: number;
    status: string;
    summoner: { displayName: string, profileIconId: number, summonerLevel: number, percentCompleteForNextLevel: number, xpUntilNextLevel: number };
    wallet: { ip: number, rp: number }
    statusHistory: [{ timestamp: string, status: string }]
    settings: { autoPlay: boolean, queue: number, targetLvl: number, targetBE: number }
    phaseData: {}
    socket: WebSocket
}

enum MessageType {
    REQUEST = 10,  // interface to server [10, "RandomID" ,"RequestName", {requestdata}]
    RESPONSE_SUCCESS = 20, // srv 2 intfc [20, "RandomID", {resultdata}]
    RESPONSE_ERROR = 30, // srv 2 intfc [30, "RandomID", "error message"]
    EVENT = 40, // srv 2 intfc [40, "EventName", {eventData}] ,
    MESSAGE_ERROR = 50, // srv 2 intf [50, "original message as string", "error message"]
}

// Represents a result from the LCU api.
export interface Result {
    // Status code of the API call.
    status: number;
    // Parsed JSON of the response body.
    content: any;
}

@Component({
    components: {}
})
export default class Root extends Vue {
    connected = false;
    selected = -1;
    socket: WebSocket;
    instances: LeagueClient[] = [];
    selectedInstance: LeagueClient;
    ticks: number = 0;
    notifications: string[] = [];

    //modals
    showLoginModal = false;

    manualButtonType = "confirm";
    normalButtonType = "normal";
    connecting = false;
    hostname = (localStorage && localStorage.getItem("hostname")) || "";
    lastLolUsername = "";
    lastLolPassword = "";
    lastLolRegion = "EUW";
    lastLolQueue = "450";
    autoplay = false;

    constructor() {
        super();
        this.tick();
    }

    /**
     * @returns the most recent notification, if there is one
     */
    get notification() {
        return this.notifications[0];
    }

    /**
     * Handles any incoming messages from the websocket connection and notifies
     * listeners/resolves promises when applicable.
     */
    handleWebsocketMessage = (event: any) => {
        let data = JSON.parse(event.data);
        switch (data[0]) {
            case MessageType.EVENT:
                switch (data[1]) {
                    case "ListInstance":
                        for (let entry of data[2].List) {
                            if (entry == null)
                                continue;
                            this.addClient(entry);
                        }
                        break;
                    case "LoggingOut":
                        this.removeClient(data[2].id);
                        break;
                    case "UpdatePhase":
                        let client1 = this.instances.filter(x => x.id == data[2].id)[0];
                        if (client1) {
                            this.changeClientPhase(client1, data[2].phaseData);
                        }
                        break;
                    case "UpdateStatus":
                        let client = this.instances.filter(x => x.id == data[2].id)[0];
                        if (client) {
                            client.statusHistory.push({timestamp: new Date().toLocaleString(), status: data[2].status});
                            client.status = data[2].status;
                            client.summoner = data[2].summoner;
                            if (client.summoner == null) {
                                client.summoner = {
                                    summonerLevel: 0,
                                    profileIconId: 0,
                                    displayName: "Connecting...",
                                    percentCompleteForNextLevel: 0,
                                    xpUntilNextLevel: 0
                                };
                            }
                            if (client.wallet == null) {
                                client.wallet = {ip: 0, rp: 0}
                            }
                        } else {
                            this.addClient(data[2]);
                        }
                        break;
                }
                break;
            case MessageType.RESPONSE_SUCCESS:
                break;
            case MessageType.MESSAGE_ERROR:
                this.showNotification("Message Error.");
                break;
        }
    };

    private removeClient(id: number) {
        let temp: LeagueClient[] = this.instances.filter(x => x.id != id);
        this.selected = -1;
        this.instances = temp;
        this.selectedInstance = this.instances[0];
    }

    private changeClientPhase(client: LeagueClient, phase : any){
        client.phaseData = phase;
    }

    private addClient(data: any) {
        console.log(data);
        let newClient: LeagueClient = data;
        if (newClient.summoner == null) {
            newClient.summoner = {
                summonerLevel: 0,
                profileIconId: 0,
                displayName: "Connecting...",
                percentCompleteForNextLevel: 0,
                xpUntilNextLevel: 0
            };
        }
        if (newClient.wallet == null) {
            newClient.wallet = {ip: 0, rp: 0}
        }
        newClient.statusHistory = [{timestamp: new Date().toLocaleString(), status: "Added to current Session."}];
        newClient.socket = this.socket;
        this.instances.push(newClient);
    }

    private selectDashboard(){
        this.selected = -1;
    }

    private selectCompactView(){
        this.selected = -2;
    }

    private selectToThis(instance: LeagueClient) {
        this.selected = instance.id;
        this.selectedInstance = instance;
    }

    /**
     * Automatically (re)connects to the websocket.
     */
    private connect() {
        localStorage && localStorage.setItem("hostname", this.hostname);
        this.connecting = true;

        try {
            this.socket = new WebSocket("ws://" + this.hostname + ":8000/volibot");

            this.socket.onopen = () => {
                this.connected = true;
                this.connecting = false;
                let list: [number, any, string, any];
                list = [MessageType.REQUEST, "0", "RequestInstanceList", ""];
                this.socket.send(JSON.stringify(list));
            };

            this.socket.onmessage = this.handleWebsocketMessage;

            this.socket.onclose = ev => {
                if (this.connecting) {
                    this.showConnectingError("Closed unexpectedly (" + ev.reason + ")");
                    return;
                }

                this.connected = false;
                this.showNotification("Connection to host closed.");
            };
        } catch (e) {
            this.showConnectingError(e.message);
        }
    }

    private showAddModal() {
        this.showLoginModal = true;
    }

    private hideAddModal() {
        this.showLoginModal = false;
    }

    private addAccountModal() {
        let list: [number, any, string, any];
        list = [MessageType.REQUEST, "0", "RequestInstanceStart", JSON.parse("{\"username\":\"" + this.lastLolUsername + "\", \"password\": \"" + this.lastLolPassword + "\", \"region\": \"" + this.lastLolRegion + "\", \"queue\": " + this.lastLolQueue + ", \"autoplay\": " + this.autoplay + "}")];
        this.socket.send(JSON.stringify(list));
        this.hideAddModal();
    }

    /**
     * Shows a connecting error in the second button.
     */
    private showConnectingError(message: string) {
        this.connecting = false;
        this.manualButtonType = "deny";
        setTimeout(() => this.manualButtonType = "confirm", 2500);
        this.showNotification("Failed to connect. Is VoliBot running?");
    }

    /**
     * Shows a notification that hides after a few moments.
     */
    private showNotification(content: string) {
        this.notifications.push(content);
        setTimeout(() => {
            this.notifications.splice(this.notifications.indexOf(content), 1);
        }, 8000);
    }

    public tick() {
        this.ticks = new Date().getTime();
        setTimeout(() => {
            this.tick();
        }, 500);
    }

    /**
     * @returns the path to the summoner icon for the inviter
     */
    getSummonerIcon(id: number): string {
        return `http://ddragon.leagueoflegends.com/cdn/${ddragon()}/img/profileicon/${id}.png`;
    }
}