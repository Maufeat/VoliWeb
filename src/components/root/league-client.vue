<template>
    <div class="league-client">
        <div class="top">
            <div class="icon">
                <img class="summonerIcon noselect" :src="summonerIcon">
                <span class="level">
                    Level {{ instance.summoner.summonerLevel }}
                </span>
            </div>
            <div class="infos">
                <h2>
                    {{ instance.summoner.displayName }}
                </h2>
                <div class="levelUpBar">
                    <div class="levelUpBg noselect" v-bind:style="{ width: instance.summoner.percentCompleteForNextLevel + '%' }"></div>
                    <span class="levelUpTxt">{{instance.summoner.xpUntilNextLevel}} XP until UP</span>
                </div>
            </div>
            <div class="wallet">
                <div class="ip"><span class="bg"><span class="noselect" style="margin:0;">BE:</span> <span class="value">{{instance.wallet.ip}}</span></span></div>
                <div class="rp"><span class="bg"><span class="noselect" style="margin:0;">RP:</span> <span class="value">{{instance.wallet.rp}}</span></span></div>
            </div>
            <div class="stats select">
                <span>
                    <strong>Status:</strong> {{ instance.status }}
                </span>
            </div>
            <div class="actions noselect">
                <button @click="logoutAccount()">Logout</button>
            </div>
        </div>
        <div class="tabulator noselect">
            <ul>
                <li v-bind:class="{ active: (activeTab == 0) }" @click="changeView(0)">Console</li>
                <li v-bind:class="{ active: (activeTab == 2) }" @click="changeView(2)">Settings</li>
            </ul>
        </div>
        <div class="content">
            <div v-if="activeTab == 0" class="history">
                <div class="row" v-for="item in instance.statusHistory">
                    <span>[{{item.timestamp}}]</span> {{item.status}}
                </div>
            </div>
            <div v-if="activeTab == 2" class="settings">
                <table>
                    <tbody>
                        <tr>
                            <td>
                                <label>Auto Play</label>
                                <input v-model="instance.settings.autoPlay" type="checkbox" name="autoplay" id="autoplay" class="flipswitch">
                                <span>Automatically goes into game for you</span>
                            </td>
                            <td>
                                <label>Queue</label>
                                <select v-model="instance.settings.queue" name="queue" id="queue" required="">
                                    <option value="450" selected>ARAM</option>
                                </select>
                                <span>In which queue should it go?</span>
                            </td>
                            <td style="width: 150px;">
                                <label>Target Level</label>
                                <input type="number" name="autoplay" id="targetlvl">
                                <span>Stops at ^Level</span>
                            </td>
                            <td style="width: 150px;">
                                <label>Target Blue Essence</label>
                                <input type="number" name="autoplay" id="targetbe">
                                <span>Stops at ^BE</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <hr>
                <button style="width:100%">Save Settings</button>
            </div>
        </div>
        <div style="height: 1px;">{{ ticks }}</div>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import { Component, Prop } from "vue-property-decorator";
    import { LeagueClient } from "./root";
    import { ddragon } from "../../constants";

    @Component
    export default class LeagueClientComponent extends Vue {

        @Prop()
        instance: LeagueClient;
        ticks : number = 0;
        activeTab : number = 0;

        constructor() {
            super();
            this.tick();
        }

        get summonerIcon(): string {
            return `http://ddragon.leagueoflegends.com/cdn/${ddragon()}/img/profileicon/${this.instance.summoner.profileIconId}.png`;
        }

        public changeView(view: number){
            if(this.activeTab != view)
                this.activeTab = view;
        }

        public logoutAccount(){
            let list: [number, any, string, any];
            list = [10, "0", "RequestInstanceLogout", JSON.parse("{\"id\":" + this.instance.id + "}")];
            console.log(list);
            this.instance.socket.send(JSON.stringify(list));
        }

        public tick() {
            this.ticks  = new Date().getTime();
            setTimeout(() => {
                this.tick();
            }, 500);
        }
    }
</script>

<style lang="stylus" scoped>
    .flipswitch
    {
        position: relative;
        background: #1e2328;
        width: 120px;
        height: 35px;
        -webkit-appearance: initial;
        border-radius: 3px;
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
        outline:none;
        font-size: 14px;
        font-family: Trebuchet, Arial, sans-serif;
        font-weight: bold;
        cursor:pointer;
        border: 1px solid #785b28;
    }
    .flipswitch:after
    {
        position:absolute;
        top:5%;
        display:block;
        line-height:29px;
        width:45%;
        height:90%;
        background:#1e2328;
        box-sizing:border-box;
        text-align:center;
        transition: all 0.1s ease-in 0s;
        color:grey;
        border: 1px solid #785b28;
        border-radius:3px;
    }
    .flipswitch:after
    {
        left:2%;
        content: "NO";
    }
    .flipswitch:checked:after
    {
        left:53%;
        content: "YES";
    }
    select, input
        width 100%
        color: rgb(240, 230, 210)
        margin:10px 0
        font-family "LoL Body"
        background-color black
        background: #1e2328;
        border: 1px solid #785b28;
        box-shadow: 0 3px 5px rgba(1,10,19,.5) inset;
        padding: 8px 30px 8px 10px;
        border-radius: 0;
        transition: 0.2s all
        &:focus
            border-color: #0596aa;
            background: #333639;
            outline: 0;
        &:hover
            border-color: #048091;
    input[type="number"]{
        text-align:right;
        padding:0;
        padding-right:10px;
    }
    hr
        border-color: #b78c3d6e;
    .noselect {
        -webkit-touch-callout: none; /* iOS Safari */
        -webkit-user-select: none; /* Safari */
        -khtml-user-select: none; /* Konqueror HTML */
        -moz-user-select: none; /* Firefox */
        -ms-user-select: none; /* Internet Explorer/Edge */
        user-select: none; /* Non-prefixed version, currently
                                  supported by Chrome and Opera */
    }
    .select {
        -webkit-touch-callout: auto; /* iOS Safari */
        -webkit-user-select: auto; /* Safari */
        -khtml-user-select: auto; /* Konqueror HTML */
        -moz-user-select: auto; /* Firefox */
        -ms-user-select: auto; /* Internet Explorer/Edge */
        user-select: auto; /* Non-prefixed version, currently
                                  supported by Chrome and Opera */
    }
    button
        min-width: 125px;
        display: inline-block;
        padding: 8px 14px;
        background: #1e2328;
        border: 1px solid transparent;
        border-color: #6a4f28;
        -o-border-image: linear-gradient(to bottom, #b78c3d 0, #6a4f28 100%);
        border-image: -webkit-linear-gradient(top, #b78c3d 0, #6a4f28 100%);
        border-image: linear-gradient(to bottom, #b78c3d 0, #6a4f28 100%);
        border-image-slice: 1;
        border-width: 2px;
        font-family: "Beaufort for LOL", "Times New Roman", sans-serif;
        font-weight: 400;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        font-smoothing: antialiased;
        letter-spacing: 1.2px;
        color: #ccbf92;
        text-transform: uppercase;
        text-decoration: none;
        cursor: pointer;
        outline:none;
        &:hover
            color: #f0e6d2;
            background: -webkit-linear-gradient(top, #202529 0, #393931 100%);
            background: linear-gradient(to bottom, #202529 0, #393931 100%);
            -o-border-image: linear-gradient(to bottom, #f0e5d1 0, #c99e40 100%);
            border-image: -webkit-linear-gradient(top, #f0e5d1 0, #c99e40 100%);
            border-image: linear-gradient(to bottom, #f0e5d1 0, #c99e40 100%);
            border-image-slice: 1;
    .league-client
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.561);
        .top
            display flex
            flex-direction row
            padding:20px;
            border-bottom: 2px solid #7e633b;
            .summonerIcon
                width: 100px;
                height: 100px;
        .top .icon
            width: auto;
            height: auto;
            box-sizing: border-box;
            border: 3px solid transparent;
            border-color: #6a4f28;
            -o-border-image: linear-gradient(to bottom, #b78c3d 0, #6a4f28 100%);
            border-image: -webkit-linear-gradient(top, #b78c3d 0, #6a4f28 100%);
            border-image: linear-gradient(to bottom, #b78c3d 0, #6a4f28 100%);
            border-image-slice: 1;
            .level
                position: relative;
                margin: 0;
                width: 100%;
                margin-top: -23px;
                display: block;
                text-align: center;
                background-color: #00000085;
        .top .infos
            display flex
            flex-direction column
            justify-content:center;
            align-items space-between
            min-width: 300px;
            h2
                text-align:center;
        .top .levelUpBar
            position: relative;
            margin-top: 12px;
            height: 25px;
            font-size: 21px;
            background-color: #252a31;
            border: 2px solid #926f33;
            min-width: 125px;
            margin-left: 20px;
        .top .levelUpTxt
            position: absolute;
            margin: 0;
            width: 100%;
            text-align: center;
            line-height: 25px;
            font-size: 16px;
            top: 0;
        .top .levelUpBg
            background-color: #660080;
            height: 100%;
        .top .wallet
            display: flex;
            flex-direction: column;
            div
                flex: 1;
                display: flex;
                flex-direction: column;
                justify-content: center;
                .bg
                    padding: 5px 15px;
                    font-size: 21px;
                    background-color: #252a31;
                    border: 2px solid #926f33;
                    min-width: 125px;
                    .value
                        text-align:right;
                        display: block;
                        position: relative;
                        margin-top: -24px;
        .top .stats
            flex: 1;
            width: 100%;
            text-align: center;
            display: flex;
            -webkit-box-orient: vertical;
            -webkit-box-direction: normal;
            -ms-flex-direction: column;
            flex-direction: column;
            -webkit-box-pack: center;
            -ms-flex-pack: center;
            justify-content: center;
            span
                margin:0;
        .top span
            margin-left 20px
            color white
            font-size: 21px;
        .top h2
            margin: 0;
            margin-left: 20px;
            color white
            font-size: 38px;
        .top span i
            color #f0e6d3
            margin-right 4px
        .tabulator
            height:60px;
            width:100%;
            background-color: rgba(0,10,19,0.7);
            position:relative;
            box-shadow: 0 0 15px 5px rgba(0,0,0,0.5);
            ul
                margin: 0;
                padding: 0;
                list-style: none;
                display: flex;
                .active
                    color: #d1d2d4;
                    background-color: #ffffff05;
                    border-bottom: 3px solid #7e6532;
                li
                    cursor:pointer;
                    transition:.3s all;
                    height:100%;
                    color: #d1d2d4;
                    text-align:center;
                    min-width:150px;
                    line-height:60px;
                    font-size:26px;
                    border-right: 1px solid #9a753570;
                    &:hover
                        color: #d1d2d4;
                        background-color: #ffffff05;
                        box-shadow: 0 0 15px 5px #ffffff05;
                        border-bottom: 3px solid #7e6532;
        .content
            height: calc(100% - 239px);
            padding: 10px;
            background-color: rgba(18, 21, 23, 0.85);
            color:white;
            h1
                margin: 0;
                padding: 0;
                height: 100%;
                line-height: calc(100vh - 250px);
                text-align: center
                color rgb(255, 255, 255)
                text-shadow 0 0 20px rgb(255, 35, 0)
        .settings
            table
                width:100%;
            tr
                width:100%;
                color:white;
                td
                    padding:10px;
                    label
                        display:block;
                    input
                        height: 40px;
                        width:100%;
                    span
                        color: grey;
                        font-size 14px
        .history
            color: #fff;
            height: 100%;
            overflow-y: scroll;
            font-family: "Lucida Console", "Lucida Sans Typewriter", monaco, "Bitstream Vera Sans Mono", monospace;
            border: 1px solid #ffffff5c;
            padding: 5px;
            background-color: black;
            .row
                display: block;
            span
                color:yellow;
        .right
            display flex
            flex-direction row
            color white
            font-size 70px
        .right i
            margin 20px
        .right img
            width 85px
            height 85px
            margin 0 15px
</style>