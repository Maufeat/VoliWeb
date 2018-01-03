<template>
    <div>
        <div class="background-greyscale">
            <div class="gradient"></div>
        </div>

        <div class="body">
            <div v-if="!connected" class="intro noselect">
                <h2>Welcome to VoliBot</h2>

                <div class="manual">
                    <div class="form">
                        <span>IP address</span>
                        <input v-model="hostname" placeholder="192.168.1.1">
                        <lcu-button :disabled="(!hostname) || connecting" :type="manualButtonType" @click="connect()">Connect</lcu-button>
                    </div>
                    <small>Version: 1.0.0</small>
                </div>


                <lcu-button class="get-voli" :type="normalButtonType" onclick="location.href='http://volibot.com/download'">Get VoliBot</lcu-button>

            </div>

            <div v-else="" class="main">
                <div class="left-sidebar noselect">
                    <ul id="menu-list">
                        <li @click="selectCompactView()" v-bind:class="{ active: this.selected == -2 }">
                            <div class="client-name">
                                <h2>Compact View</h2>
                            </div>
                        </li>
                    </ul>
                    <h2>Client List</h2>
                    <ul id="client-list">
                        <li v-for="client in instances" @click="selectToThis(client)" v-bind:class="{ active: this.selected == client.id }">
                            <div class="sum-icon">
                                <img :src="getSummonerIcon(client.summoner.profileIconId)">
                                <span>Lv {{ client.summoner.summonerLevel }}</span>
                            </div>
                            <div class="client-name">
                                <h2>{{ client.summoner.displayName }}</h2>
                                <span><small>{{ client.status }}</small></span>
                            </div>
                        </li>
                    </ul>
                    <div class="btn-pad">
                        <lcu-button :type="manualButtonType" @click="showAddModal()">Add new Client</lcu-button>
                    </div>
                </div>
                <div v-if="selected >= 0" class="instance">
                    <league-client
                            :key="selectedInstance.Id"
                            :instance="selectedInstance">
                    </league-client>
                </div>
                <div v-else-if="selected == -2" class="compact">
                    <div v-for="client in instances"  class="league-client">
                        <div class="top">
                            <div class="icon">
                                <img class="summonerIcon noselect" :src="getSummonerIcon(client.summoner.profileIconId)">
                                <span class="level">
                                    Level {{ client.summoner.summonerLevel }}
                                </span>
                            </div>
                            <div class="infos">
                                <h2>
                                    {{ client.summoner.displayName }}
                                </h2>
                                <div class="levelUpBar">
                                    <div class="levelUpBg noselect" v-bind:style="{ width: client.summoner.percentCompleteForNextLevel + '%' }"></div>
                                    <span class="levelUpTxt">{{client.summoner.xpUntilNextLevel}} XP until UP</span>
                                </div>
                            </div>
                            <div class="wallet">
                                <div class="ip"><span class="bg"><span class="noselect" style="margin:0;">BE:</span> <span class="value">{{client.wallet.ip}}</span></span></div>
                                <div class="rp"><span class="bg"><span class="noselect" style="margin:0;">RP:</span> <span class="value">{{client.wallet.rp}}</span></span></div>
                            </div>
                            <div class="stats select">
                                <span>
                                    <strong>Status:</strong> {{ client.status }}
                                </span>
                            </div>
                            <div class="actions noselect">
                                <button @click="selectToThis(client)">Go to Client View</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-else-if="selected == -1" class="bot-nofocus">
                    <h1>Please select or start an instance</h1>
                </div>
                <div style="width: 1px;">{{ ticks }}</div>
            </div>

            <transition name="fades">
                <div v-if="showLoginModal" class="modal-bg"></div>
            </transition>
            <transition name="bounce">
                <div v-if="showLoginModal" class="modal">
                        <div v-if="showLoginModal" class="modal-container">
                            <div class="modal-top">
                                <button style="left: 150px;position: relative;    min-width: 0;" @click="hideAddModal()" class="close">X</button>
                                <h2>Add new Account</h2>
                            </div>
                            <div class="modal-content">
                                <input v-model="lastLolUsername" name="lolUsername" placeholder="Username" required="">
                                <input v-model="lastLolPassword" name="lolPass" placeholder="Password" type="password" required="">
                                <select v-model="lastLolRegion" name="region" id="region" required="">
                                    <option value="EUW" selected="selected">Europe West (EUW)</option>
                                    <option value="NA">North America (NA)</option>
                                    <option value="EUNE">Europe North East (EUNE)</option>
                                    <option value="JP">Japan (JP)</option>
                                    <option value="LA1">Latin North (LAN)</option>
                                    <option value="LA2">Latin South (LAS)</option>
                                    <option value="OC1">Oceania (OCE)</option>
                                    <option value="RU">Russia (RU)</option>
                                    <option value="TR">Turkey (TR)</option>
                                </select>
                                <select v-model="lastLolQueue" name="queue" id="queue" required="">
                                    <option value="450" selected>ARAM</option>
                                </select>
                                <label for="autoplay" class="autoplay "><span>Auto Queue: </span><input class="flipswitch" type="checkbox" v-model="autoplay" name="autoplay" id="autoplay" /></label>
                            </div>
                            <div class="modal-bottom noselect">
                                <div class="btns">
                                    <a @click="addAccountModal()" class="c-btn" id="c-modal-button">ADD</a>
                                </div>
                            </div>
                        </div>
                </div>
            </transition>

            <transition enter-active-class="fadeIn" leave-active-class="fadeOut">
                <div v-if="notification" class="notification select">
                    {{ notification }}
                </div>
            </transition>
        </div>
    </div>
</template>

<script lang="ts" src="./root.ts"></script>

<style lang="stylus" scoped>
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
    .fades-enter-active {
        animation: fades .5s;
    }
    .fades-leave-active {
        animation: fades .5s reverse;
    }
    @keyframes fades {
        0% {
            transform: opacity(0);
        }
        100% {
            transform: opacity(1);
        }
    }

    .bounce-enter-active {
        animation: bounce-in .5s;
    }
    .bounce-leave-active {
        animation: bounce-in .2s reverse;
    }
    @keyframes bounce-in {
        0% {
            transform: scale(0);
        }
        20% {
            transform: scale(1.1);
        }
        100% {
            transform: scale(1);
        }
    }

    :focus
        outline 0

    .body
        background-color: #0a0a0c
        height: 100%;
        width: 100%;

    .background-greyscale
        background-image: url(http://static.zerochan.net/Volibear.full.1523582.jpg);
        background-size: cover;
        background-position: left top;
        position: absolute;
        top: 0;
        right: 0;
        bottom: 20%;
        left: 0;
        opacity: .2;

        .gradient
            position: absolute;
            top: 0;
            right: 0;
            z-index: 1;
            bottom: 0;
            left: 0;
            background-color: #0a0a0c;
            background-image: linear-gradient(180deg,#0a0a0c,transparent,#0a0a0c);
            background-color: transparent;
    // Intro
    // Position the message in the center.
    .intro
        position absolute
        left 0
        top 0
        right 0
        bottom 0
        display flex
        flex-direction column
        justify-content center
        align-items center

        .divider
            margin: 20px auto;
            height: 1px;
            max-width: 765px;
            border: 0;
            background: linear-gradient(to right,transparent 0,#372e19 15%,#694b21 50%,#372e19 85%,transparent 100%);

        .get-voli
            margin: 25px;
            width: 250px;

        h2
            text-align center
            font-family "LoL Header"
            color #f0e6d3
            font-weight: 400;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            font-smoothing: antialiased;
            font-size: 38px;
            & > small
                font-size 60px
                color #dcd2bf

        .automatic, .manual
            width 350px
            display flex
            flex-direction column
            justify-content center
            align-items center
            text-align: left;
            max-width: 380px;
            margin: 0 auto;
            padding: 38px;
            padding-bottom: 50px;
            background: rgba(1,10,19,.85);
            border: 1px solid transparent;
            border-color: #6a4f28;
            -moz-border-image: -moz-linear-gradient(top,#6a4f28 0,#b78c3d 100%);
            -webkit-border-image: -webkit-linear-gradient(top,#6a4f28 0,#b78c3d 100%);
            border-image: linear-gradient(to bottom,#b78c3d 0,#6a4f28 100%);
            border-image-slice: 1;
            position: relative;
            &:before
                display: block;
                content: '';
                border: 1px solid #f0e6d2;
                opacity: .15;
                position: absolute;
                top: 7px;
                right: 7px;
                bottom: 7px;
                left: 7px;
                z-index: 1;
        small
            font-size: 55%;
            color: white;
            opacity: 0.5;
            text-transform: uppercase;
            position: absolute;
            bottom: 15px;
            right: 15px;
        .form
            position: relative;
            z-index: 2;
        .manual span
            color #f0e6d3
            font-family "LoL Body"
            font-family: "Times New Roman",sans-serif;
            font-weight: 700;
            letter-spacing: 0;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            font-smoothing: antialiased;
            color: #f0e6d2;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 1.2px;
            align-self flex-start
        .or
            width 100%
            display flex
            align-items center
            justify-content space-around
            flex-direction row
        .or div
            flex 1 0
            height 3px
            background-color alpha(#fffce1, 0.6)
        .or span
            flex 0
            padding 10px
            color #d5d9c9
            font-family "LoL Body"
            font-size 40px

    // Make sure the body has the full size.
    .main
        display flex
        flex-direction row
        height 100%
        overflow hidden

        .bot-nofocus
            width 100%
            h1
                text-align: center
                line-height calc(100vh - 39px)
                color rgb(255, 255, 255)
                text-shadow 0 0 20px rgb(255, 35, 0)
                text-transform uppercase
        .hidebar
            color:white;
            width 5px
            background-color: rgba(255, 255, 255, 0.2);
            display flex
            flex-direction column
            z-index 99999
            overflow visible
            justify-content: center;
            cursor col-resize
            p
                margin: 0;
                font-size: 10px;
                opacity 0.5
        .left-sidebar
            color:white;
            width 300px
            background-color: rgba(0, 10, 19, 0.7);
            display flex
            flex-direction column
            box-shadow 0 0 15px 5px rgba(0,0,0,0.5)
            z-index 9999
            resize:horizontal;
            overflow hidden
            h2
                padding-left: 10px;
                margin: 10px 0;
            .btn-pad
                padding 15px

            #menu-list
                border-top: 3px solid #32281f;
                list-style none
                padding 0
                margin 0
                li
                    background-color #101217
                    color rgba(255,255,255,0.5)
                    border-bottom 2px solid #32281f
                    transition all 0.2s
                    font-size:14px;
                    cursor pointer
                    display flex

                    &:hover
                        color rgba(255,255,255,0.8)
                        border-color #7e633b
                        background-color #14181d
            #client-list
                border-top: 3px solid #32281f;
                height 100%
                list-style none
                padding 0
                margin 0
                overflow-y auto
                overflow-x hidden

                li
                    background-color #101217
                    color rgba(255,255,255,0.5)
                    border-bottom 2px solid #32281f
                    transition all 0.2s
                    padding 10px
                    cursor pointer
                    display flex

                    &:hover
                        color rgba(255,255,255,0.8)
                        border-color #7e633b
                        background-color #14181d

                    .sum-icon
                        margin-right 10px
                        span
                            position: relative;
                            margin: 0;
                            width: 100%;
                            padding: 3px 0;
                            margin-top: -24px;
                            display: block;
                            text-align: center;
                            background-color: rgba(0,0,0,0.522);
                        img
                            width 60px
                            height 60px
                            border 1px solid rgba(255, 255, 255, 0.2)
                            ^[-1]:hover &
                                border 1px solid rgba(255, 255, 255, 0.5)

                    .client-name
                        h2
                            margin:0;
                            padding:0;
                            margin-top 10px
                            margin-bottom 5px
                            font-size: 20px;

                .active
                    color rgba(255,255,255,0.8)
                    border-color #7e6532
                    background-color #1b2027
                    &:hover
                        color rgba(255,255,255,0.8)
                        border-color #7e633b
                        background-color #222931

            button#button
                margin-top auto

        .dashboard
            width 100%
            display flex
            flex-flow column
            z-index 5
            color: white
            background-color: rgba(0,0,0, 0.5);
            h1
                padding: 0 35px;
        .compact
            width 100%
            display flex
            flex-flow column
            z-index:5;
            color #242929
            overflow-y: scroll;

            .league-client
                width: 100%;
                background-color: rgba(0,0,0,0.561);
            .top
                display flex
                flex-direction row
                padding: 10px 20px;
                border-bottom: 2px solid #7e633b;
                .summonerIcon
                    width: 75px;
                    height: 75px;
            .top .icon
                height: 79px;
                width: 79px;
                box-sizing: border-box;
                border: 2px solid transparent;
                border-color: #6a4f28;
                -o-border-image: linear-gradient(to bottom, #b78c3d 0, #6a4f28 100%);
                border-image: -webkit-linear-gradient(top, #b78c3d 0, #6a4f28 100%);
                border-image: linear-gradient(to bottom, #b78c3d 0, #6a4f28 100%);
                border-image-slice: 1;
                .level
                    position: relative;
                    margin: 0;
                    width: 100%;
                    margin-top: -18px;
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
                    font-size 21px
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
                        padding: 5px 10px;
                        font-size: 16px;
                        background-color: #252a31;
                        border: 2px solid #926f33;
                        min-width: 125px;
                        .value
                            text-align:right;
                            display: block;
                            position: relative;
                            margin-top: -18px;
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
                font-size: 16px;
            .top h2
                margin: 0;
                margin-left: 20px;
                color white
                font-size: 38px;
            .top span i
                color #f0e6d3
                margin-right 4px
        .instance
            width 100%
            display flex
            flex-flow column
            z-index:5;
            color #242929

            .header
                height 150px
                padding 0 25px;

            .tab-menu
                height 100px

            .container
                height 100%

    .notification
        z-index: 1000;
        position: absolute;
        background-color: rgba(200, 170, 109, 0.13);
        padding: 10px 25px;
        text-transform: uppercase;
        border: 2px solid rgba(120, 90, 40, 0.7);
        bottom: 15;
        width: auto;
        right: 15;
        color: #d5d9c9;
        font-family: "LoL Body";
        text-align: center;

    .modal-bg
        z-index: 9999;
        background-color: rgba(0, 0, 0, 0.7);
        position: fixed;
        width:100%;
        top:0;
        height:100%;
    .modal
        z-index: 9999;
        position: fixed;
        width:100%;
        top:0;
        height:100%;
        color: #d5d9c9;
        font-family: "LoL Body";
        .modal-container
            position: fixed;
            top: 20%;
            left: 50%;
            z-index: 1001;
            width: 330px;
            transform: translate(-50%,0);
            text-align: center;
            .modal-top
                background: url(https://signup.na.leagueoflegends.com/assets/img/modal/top.svg) no-repeat top center;
                width: 100%;
                height: 30px;
                margin: 0 auto;
                z-index:999;
                position:relative;
                .close
                    left: 150px;
                    cursor: pointer;
                    position: relative;
                    border: 2px solid #785b28;
                    background-color: #071321;
                    color: red;
                    padding: 6px 10px;
                    transform: rotate(45deg);
                    box-shadow: 0 0 0px red;
                    &:hover
                        box-shadow: 0 0 15px red;
                h2
                    margin: 0 10px;
                    padding: 5px 10px 5px;
                    border-bottom: 1px solid #785b28;
            .modal-content
                position:relative;
                margin-top: -13px;
                padding: 60px 10px 50px;
                z-index:5;
                background: rgba(7, 20, 35, 0.9)
                margin-bottom: -41px;
                border: 1px solid transparent;
                border-color: #6a4f28;
                -o-border-image: linear-gradient(to bottom, #b78c3d 0, #6a4f28 100%);
                border-image: -webkit-linear-gradient(top, #b78c3d 0, #6a4f28 100%);
                border-image: linear-gradient(to bottom, #b78c3d 0, #6a4f28 100%);
                border-image-slice: 1;
                border-top:0;
                .autoplay
                    display:flex;
                    span
                        font-size: 21px;
                        margin-top: 5%;
                        font-family: Arial;
                        margin-left: 1%;
                    input
                        width: 100px;
                        margin-right: 5px;
                span
                    font-family: "Times New Roman", sans-serif;
                    text-align:left;
                    display:block;
                    width:100%;
            .modal-bottom
                z-index:999;
                position: relative;
                overflow: hidden;
                display: flex;
                justify-content: center;
                max-width: 327px;
                margin: 0 auto;
                .btns
                    border-bottom: 1px solid #785b28;
                    display: inline-block;
                    padding: 3px;
                    width: 100%;
                    line-height: 1.39em;
                    .c-btn
                        width: 125px;
                        display: inline-block;
                        padding: 8px 14px;
                        background: #1e2328;
                        border: 1px solid transparent;
                        border-color: #6a4f28;
                        -moz-border-image: -moz-linear-gradient(top,#6a4f28 0,#b78c3d 100%);
                        -webkit-border-image: -webkit-linear-gradient(top,#6a4f28 0,#b78c3d 100%);
                        border-image: linear-gradient(to bottom,#b78c3d 0,#6a4f28 100%);
                        border-image-slice: 1;
                        border-width: 2px;
                        font-family: "Beaufort for LOL","Times New Roman",sans-serif;
                        font-weight: 400;
                        -webkit-font-smoothing: antialiased;
                        -moz-osx-font-smoothing: grayscale;
                        font-smoothing: antialiased;
                        letter-spacing: 1.2px;
                        color: #ccbf92;
                        text-transform: uppercase;
                        text-decoration: none;
                        cursor: pointer;
                        &:hover
                            color: #f0e6d2;
                            background: linear-gradient(to bottom,#202529 0,#393931 100%);
                            -moz-border-image: -moz-linear-gradient(top,#c99e40 0,#f0e5d1 100%);
                            -webkit-border-image: -webkit-linear-gradient(top,#c99e40 0,#f0e5d1 100%);
                            border-image: linear-gradient(to bottom,#f0e5d1 0,#c99e40 100%);
                            border-image-slice: 1;
                &:before
                    content: '';
                    background: url(https://signup.na.leagueoflegends.com/assets/img/modal/bottom-left.svg) no-repeat top left;
                    left: 0;
                    z-index: -1;
                    width: 79px;
                    height: 15px;
                    display: inline-block;
                    position: relative;
                    top: 30px;
                    flex-shrink: 0;
                &:after
                    content: '';
                    background: url(https://signup.na.leagueoflegends.com/assets/img/modal/bottom-right.svg) no-repeat top left;
                    right: 0;
                    z-index: -1;
                    width: 79px;
                    height: 15px;
                    display: inline-block;
                    position: relative;
                    top: 30px;
                    flex-shrink: 0;
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
</style>