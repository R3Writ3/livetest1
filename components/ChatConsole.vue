<template>
  <v-row justify="center" align="center">
    <div :style="[(userDetail || ticketProp) && toggleChat? {'width' : 'calc(100% - 500px)'} : {'width' : 'calc(100% - 250px)'}]" class="d-flex chat-box">
      <v-row v-if="isCurrentUserExist && toggleChat && !userListShow" align="start" style="width: 100%; " class="no-margin inputbg">
        <v-toolbar height="60px" flat tile>
          <v-btn v-show="mobile" class="secondary--text" icon @click="userListShow = !userListShow">
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
          <v-avatar size="36" style="cursor: pointer;" @click="userDetail = !userDetail; ticketProp = false">
            <v-img
              :src="currentChat.data.avatar"
            />
          </v-avatar>
          <v-toolbar-title style="font-size: 0.875rem !important;" class="ml-5 primary--text font-weight-medium">
            {{ currentChat.data.name ? currentChat.data.name : currentChat.data.id }}
            <div v-if="currentChat.data.connected && currentChat.data.connected.url && currentChat.data.connected.name" class="caption">
              From <a target="_blank" :href="currentChat.data.connected.url">{{ currentChat.data.connected.name }}</a>
            </div>
          </v-toolbar-title>
          <v-spacer />
          <v-tooltip v-if="currentChat.tickets.info" bottom>
            <template #activator="{ on, attrs }">
              <v-btn
                v-show="!mobile"
                v-bind="attrs"
                icon
                class="secondary--text"
                @click="noteDialog = true"
                v-on="on"
              >
                <v-badge
                  :value="currentChat.tickets.info && currentUser.tickets.info.note && currentUser.tickets.info.note.length > 0"
                  color="red"
                  dot
                  overlap
                >
                  <v-icon>mdi-note-outline</v-icon>
                </v-badge>
              </v-btn>
            </template>
            <span>Ticket note</span>
          </v-tooltip>
          <v-tooltip bottom>
            <template #activator="{ on, attrs }">
              <v-btn
                v-show="!mobile && currentUser.tickets.status !== 'solved'"
                icon
                v-bind="attrs"
                class="secondary--text"
                v-on="on"
                @click="updateTicketStatus(currentUser.tickets.status === 'hold' ? 'unhold' : 'hold')"
              >
                <v-icon>{{ currentUser.tickets.status !== 'hold' ? 'mdi-pause' : 'mdi-play' }}</v-icon>
              </v-btn>
            </template>
            <span>{{ currentUser.tickets.status !== 'hold' ? 'Hold ticket' : 'Resume ticket' }}</span>
          </v-tooltip>
          <v-tooltip bottom>
            <template #activator="{ on, attrs }">
              <v-btn
                v-show="!mobile"
                icon
                v-bind="attrs"
                class="secondary--text"
                v-on="on"
                @click="updateTicketStatus(currentUser.tickets.status === 'solved' ? 'unsolved' : 'solved')"
              >
                <v-icon>{{ currentUser.tickets.status === 'solved' ? 'mdi-autorenew' : 'mdi-check' }}</v-icon>
              </v-btn>
            </template>
            <span>{{ currentUser.tickets.status === 'solved' ? 'Unsolve ticket' : 'Solve ticket' }}</span>
          </v-tooltip>
          <v-menu v-if="mobile" offset-y>
            <template #activator="{ on, attrs }">
              <v-btn v-bind="attrs" icon class="secondary--text" v-on="on">
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item-group>
                <v-list-item @click="noteDialog = true">
                  <v-list-item-icon>
                    <v-badge
                      v-if="currentUser.tickets.info"
                      :value="currentUser.tickets.info && currentUser.tickets.info.note && currentUser.tickets.info.note.length > 0"
                      color="red"
                      dot
                      overlap
                    >
                      <v-icon>mdi-note-outline</v-icon>
                    </v-badge>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>Ticket Note</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item @click="holdTicket">
                  <v-list-item-icon>
                    <v-icon>{{ currentUser.tickets.status !== 'hold' ? 'mdi-pause' : 'mdi-play' }}</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>{{ currentUser.tickets.status !== 'hold' ? 'Hold ticket' : 'Resume ticket' }}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item>
                  <v-list-item-icon>
                    <v-icon>mdi-check</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>Solve Ticket</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item @click="ticketProp = true">
                  <v-list-item-icon>
                    <v-icon>mdi-view-list</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>Ticket Properties</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list-item-group>
            </v-list>
          </v-menu>
          <v-tooltip v-else bottom>
            <template #activator="{ on, attrs }">
              <v-btn
                v-show="!mobile"
                v-bind="attrs"
                icon
                class="secondary--text"
                v-on="on"
                @click="ticketProp = !ticketProp; userDetail = false"
              >
                <v-icon>mdi-view-list</v-icon>
              </v-btn>
            </template>
            <span>Ticket Properties</span>
          </v-tooltip>
        </v-toolbar>
      </v-row>
      <div
        v-if="isCurrentUserExist && toggleChat"
        class="d-flex no-margin row chat-box-open accent mt-0"
        justify="center"
        true
        style="width: 100%;"
      >
        <perfect-scrollbar v-if="!userListShow" id="chat-window" infinite-wrapper class=" d-flex mb-3 flex-column">
          <infinite-loading direction="top" :identifier="currentUser.data.id" />
          <template
            v-for="(chat, i) in currentUser.messages.data"
          >
            <div v-show="setDivider(chat.date, i)" :key="chat.id + chat.date" class="ml-2 mr-2 mb-3 mt-3 chat-group-divider">
              {{
                $moment(chat.date).calendar({
                  sameDay: '[Today]',
                  lastDay: '[Yesterday]',
                  lastWeek: 'dddd',
                  sameElse: 'DD/MM/YYYY'
                }) }}
            </div>

            <div :key="chat.id" class="d-flex" :class="chat.from !== 'User' ? 'flex-row-reverse' : '' ">
              <v-avatar size="36" class="ml-3 mr-3">
                <v-img v-show="showAvatar(i)" :src="chat.from === 'User' ? currentUser.data.avatar : authUser.user.profile" alt="img" />
              </v-avatar>
              <v-card
                v-for="(msg, j) in chat.message"
                :key="msg.id"
                flat
                class="d-flex pr-3 pl-3 pb-1 pt-1 flex-column"
                :style="msg.image && msg.image.length > 0 ? {'max-width':'40% !important'} : {}"
                style="border: 2px solid #485e9029 !important;"
                :class="[chat.from !== 'User' ? 'bubble-me nav white--text' : 'bubble-you bubbleYouBg black--text', !showAvatar(j) ? 'mt-1' : 'mt-3', currentUser.messages.data.length - 1 === i ? 'mb-5' : '' ]"
              >
                <span class="font-weight-medium" style="font-size: 0.875rem;">
                  {{ chat.from === 'User' ? currentUser.data.name ? currentUser.data.name: currentUser.data.id : chat.from !== 'Bot' ? authUser.user.name : 'Bot' }}
                </span>
                <div class="d-flex" :class="msg.image || msg.audio || msg.video || msg.document ? 'flex-column' : 'flex-row'" style="min-height: 30px">
                  <div v-viewer="viewerOptions" class="v-viewer-class clearfix">
                    <img
                      v-if="msg.image && msg.image.length > 0"
                      class="chat-image"
                      :data-source="msg.image"
                      :alt="msg.image.split('?image=').pop()"
                      :src="msg.image"
                      :lazy-src="imageLoad"
                      loading="lazy"
                    >
                  </div>
                  <span v-if="msg.text && msg.text.length > 0" style="word-wrap: break-word; word-break: break-all;" v-html="replaceUrl(msg.text)" />
                  <v-chip v-if="msg.document && msg.document.length > 0" :color="chat.from !== 'User' ? 'white' : 'black'" outlined @click="downloadFile(msg.document)">
                    <v-icon left class="ml-1">
                      mdi-file-outline
                    </v-icon>
                    {{ getFilename(msg.document) }}
                    <v-icon right class="mr-1">
                      mdi-cloud-download-outline
                    </v-icon>
                  </v-chip>
                  <vue-plyr
                    v-if="msg.audio && msg.audio.length > 0"
                    :options="playerOpt"
                  >
                    <audio controls>
                      <source
                        :src="msg.audio"
                      >
                    </audio>
                  </vue-plyr>
                  <vue-plyr v-if="msg.video && msg.video.length > 0" :options="playerOpt">
                    <video
                      playsinline
                    >
                      <source
                        size="720"
                        :src="msg.video"
                      >
                      <v-btn>haha</v-btn>
                    </video>
                  </vue-plyr>
                  <div class="d-flex align-end ml-auto float-right" :class="msg.text && msg.text.length > 0 ? 'mt-0' : 'mt-1'">
                    <span style="font-size: 0.6rem; opacity: 0.6;" class="ml-3" v-text="humanTime(chat.date, false, false, true)" />
                    <v-icon v-if="chat.from !== 'User'" color="white" size="12" class="ml-1" style="margin-bottom: 2px">
                      {{ chat.sent ? 'mdi-check' : 'mdi-clock-outline' }}
                    </v-icon>
                  </div>
                </div>
              </v-card>
            </div>
          </template>
        </perfect-scrollbar>
      </div>
      <div v-else class="chat-box-closed">
        <v-chip
          close
          close-icon="mdi-message-outline"
          color="#BFC9D4"
          pill
          @click="userListShow = !userListShow"
        >
          Click User To Chat
        </v-chip>
      </div>
      <v-row
        v-if="isCurrentUserExist && toggleChat && !userListShow"
        class="d-flex no-margin text-input-container"
        :class="currentUser.tickets.status === 'hold' ? 'customDisabled' : 'inputbg'"
        :style="[(userDetail || ticketProp) && toggleChat ? {'width' : 'calc(100% - 500px)'} : {'width' : 'calc(100% - 250px)'}]"
      >
        <input ref="fileInput" type="file" class="d-none">
        <v-sheet
          class="d-flex align-center justify-center"
          style=" width: 57px;
                            border-bottom : 0px solid rgba(72, 94, 144, 0.16) !important;
                            border-top: 1px solid rgba(72, 94, 144, 0.16) !important;
                            border-right:1px solid rgba(72, 94, 144, 0.16) !important;"
          :class="currentUser.tickets.status === 'hold' ? 'customDisabled' : ''"
        >
          <v-btn :disabled="currentUser.tickets.status === 'hold'" icon :loading="fileUploadLoading" @click="$refs.fileInput.click()">
            <v-icon class="secondary--text">
              mdi-paperclip
            </v-icon>
          </v-btn>
        </v-sheet>
        <v-textarea
          v-model="currentUser.input.text"
          class="chat-compose-input"
          align="center"
          :disabled="currentUser.tickets.status === 'hold'"
          hide-details
          outlined
          :placeholder="currentUser.tickets.status === 'hold'? 'Chat held' : 'Type a message' "
          rows="1"
          row-height="15"
          auto-grow
          @keydown.enter.exact.prevent
          @keydown.enter.shift.exact.prevent
          @keyup.enter.exact="pushChat"
          @keydown.enter.shift.exact="newline"
        />
        <v-icon v-show="mobile" class="secondary--text" style="width: 57px; border-top: 1px solid rgba(72, 94, 144, 0.16) !important; border-left: 1px solid rgba(72, 94, 144, 0.16) !important;" @click="pushChat">
          mdi-send
        </v-icon>
      </v-row>
    </div>
    <v-slide-x-reverse-transition>
      <div v-if="userDetail && isCurrentUserExist && toggleChat" class="user-detail d-inline inputbg" style="border-left:1px solid rgba(72, 94, 144, 0.16) !important; height: 100%;">
        <v-toolbar flat tile height="60px">
          <v-btn icon @click="userDetail = false">
            <v-icon class="secondary--text">
              mdi-close
            </v-icon>
          </v-btn>
          <v-toolbar-title class="pa-0">
            Contact Info
          </v-toolbar-title>
          <v-spacer />
        </v-toolbar>
        <v-sheet class="text-center d-flex flex-column" style="height: calc(100vh - 124px)">
          <v-sheet class="d-flex align-center flex-column">
            <v-avatar class="mt-5 mb-3 align-self-center justify-self-center" size="180">
              <v-img :src="currentUser.data.avatar" />
            </v-avatar>
            <div class="title primary--text text-truncate" v-text="currentUser.data.name ? currentUser.data.name : currentUser.data.id" />
            <div class="subtitle-1 primary--text text-truncate d-flex justify-self-end" v-text="chatType[currentUser.data.type].alias" />
            <v-btn v-show="mobile" class="mt-4" @click="ticketProp = true">
              Ticket Properties <v-icon>mdi-chevron-right</v-icon>
            </v-btn>
          </v-sheet>
          <v-sheet class="d-flex align-end" style="flex: 1 1 auto">
            <v-btn
              dark
              block
              depressed
              tile
              height="57px"
              class="d-flex nav"
              @click="contactDialog = true"
            >
              Save
            </v-btn>
          </v-sheet>
        </v-sheet>
      </div>
    </v-slide-x-reverse-transition>
    <v-slide-x-reverse-transition>
      <div v-if="ticketProp && isCurrentUserExist && toggleChat" class="ticket-prop d-inline inputbg" style="border-left:1px solid rgba(72, 94, 144, 0.16) !important;">
        <v-toolbar flat tile height="60px">
          <v-btn icon @click="ticketProp = false">
            <v-icon class="secondary--text">
              mdi-close
            </v-icon>
          </v-btn>
          <v-toolbar-title class="pa-0">
            Ticket Properties
          </v-toolbar-title>
          <v-spacer />
        </v-toolbar>
        <div class="ticket-prop-content">
          <v-label>
            Priority
          </v-label>
          <v-tooltip top>
            <template #activator="{ on, attrs }">
              <v-icon class="pb-1" v-bind="attrs" small v-on="on">
                mdi-help-circle
              </v-icon>
            </template>
            <span>Lorem Ipsum</span>
          </v-tooltip>
          <v-select
            v-model="currentUser.tickets.priority"
            :items="state.priority"
            dense
            outlined
          />
          <v-label>
            Category
          </v-label>
          <v-tooltip top>
            <template #activator="{ on, attrs }">
              <v-icon class="pb-1" v-bind="attrs" small v-on="on">
                mdi-help-circle
              </v-icon>
            </template>
            <span>Lorem Ipsum</span>
          </v-tooltip>
          <v-autocomplete
            v-model="currentUser.tickets.category"
            :items="state.category"
            dense
            outlined
          />
          <v-label>
            Tags
          </v-label>
          <v-tooltip top>
            <template #activator="{ on, attrs }">
              <v-icon class="pb-1" v-bind="attrs" small v-on="on">
                mdi-help-circle
              </v-icon>
            </template>
            <span>Lorem Ipsum</span>
          </v-tooltip>
          <v-autocomplete
            v-model="currentUser.tickets.info.tag"
            :items="state.tags"
            outlined
            chips
            small-chips
            multiple
            dense
          />
          <v-label>
            Assign to
            <v-tooltip top>
              <template #activator="{ on, attrs }">
                <v-icon class="pb-1" v-bind="attrs" small v-on="on">
                  mdi-help-circle
                </v-icon>
              </template>
              <span>Lorem Ipsum</span>
            </v-tooltip>
          </v-label>
          <v-autocomplete
            v-model="currentUser.tickets.assign"
            :items="state.coworker"
            outlined
          />
        </div>
      </div>
    </v-slide-x-reverse-transition>
  </v-row>
</template>

<script>
export default {
  props: {
    currentChat: {
      type: Object,
      default: null
    },
    showChat: {
      type: Object,
      default: null
    },
    userExist: {
      type: Object,
      default: null
    }
  },
  mounted () {
    console.log(this.currentChat.data)
  }
}
</script>

<style scoped>
::v-deep .plyr--full-ui{
  border-radius: 10px;
  max-width: 364px
}
  .chat-image {
    width:100%;
    max-height:400px;
    cursor: pointer;
    border-radius: 10px;
    object-fit: cover;
    object-position: 100% 50%;
    display: inline-block;
  }
  .v-application{
    border:1px solid black !important;
  }
    .chat-page {
      overflow-y: hidden !important;
      height : 100%;
      margin: 0px;
    }
    .no-margin {
        margin : 0px;
    }
    #chat-window{
      overflow-x: hidden;
      height: 100%;
      width: 100%;
    }
    .user-lists{
        flex-direction: column;
        height: 100%;
        width: 250px;
        overflow-x: hidden;
        border-radius: 0px;
        border-top: 1px solid rgba(72, 94, 144, 0.16) !important;
        border-bottom : 0px solid rgba(72, 94, 144, 0.16);
        border-left: 0px !important;
        border-right:1px solid rgba(72, 94, 144, 0.16) !important;
        scrollbar-width: thin;
        padding: 0px 12px 6px 12px;
    }
      .user-panel{
        flex-direction: column;
        height: 100%;
        width: 250px;
        overflow-x: hidden;
        scrollbar-width: thin;
    }
      .user-detail{
        border-bottom : 1px solid rgba(72, 94, 144, 0.16) !important;
        border-top: 0px solid rgba(72, 94, 144, 0.16) !important;
        border-left: 1px solid rgba(72, 94, 144, 0.16) !important;
        border-right:0px solid rgba(72, 94, 144, 0.16) !important;
        flex-direction: column;
        height: 100%;
        width: 250px;
        overflow-x: hidden;
        scrollbar-width: thin;
    }

      .ticket-prop{
        border-bottom : 1px solid rgba(72, 94, 144, 0.16) !important;
        border-top: 0px solid rgba(72, 94, 144, 0.16) !important;
        border-left: 1px solid rgba(72, 94, 144, 0.16) !important;
        border-right:0px solid rgba(72, 94, 144, 0.16) !important;
        flex-direction: column;
        height: calc(100%);
        width: 250px;
        overflow-x: hidden;
        scrollbar-width: thin;
    }
      .ticket-prop-content {
        padding: 12px;
      }
      .v-label {
        font-weight: 500 !important;
      }
        .chat-box{
        width: 100%;
        flex-direction: column;
        height: calc(100% - 110px);
        display: flex;
        border-top-right-radius: 6px;
        border-bottom-right-radius: 6px;
    }
    .list-active {
      background-color: #E5E9F2 !important;
    }
    .list-active-dark {
      background-color: #121212 !important;
    }
      .chat-box-open{
        display: flex;
        flex-direction: column;
        height: 100%;
        max-width: 100%;
        margin: 0;
        position: static;
        overflow-x: hidden !important;
    }
        .chat-box-closed{
        display: grid !important;
        margin: 0;
        background-repeat: repeat;
        justify-items: center;
        align-items: center;
        max-width: 100%;
        height: 100%;
    }
        .chat-box-scroll{
        list-style-type: none;
        overflow-x: hidden !important;
        display: flex;
        max-width: 100%;
        padding: 24px 0px 4px 0px;
        flex-direction: column;
        width: 100%;
    }
    .chat-system {
        display: flex;
        height: 100%;
        margin-bottom: 10px;
    }
    .text-input-container{
      width: 100%;
      position: fixed;
      bottom: 0px;
      z-index: 999;
      border-radius: 0px;
      border-bottom : 0px;
      border-top: 1px solid rgba(72, 94, 144, 0.16);
      border-left: 0px;
      border-right: 0px;
    }
    .v-list{
        width: 100%;
    }
    .agent-panel {
    border-bottom: 0px solid rgba(72, 94, 144, 0.16);
    border-top: 1px solid rgba(72, 94, 144, 0.16) !important;
    border-left: 0px;
    border-right: 1px solid rgba(72, 94, 144, 0.16) !important;
    width: 250px;
    display: none !important;
    position: fixed;
    bottom: 0px;
    margin: 0px;
    z-index: 2;
    height: 57px !important;
    }
  ::v-deep .ps--active-x > .ps__rail-x > .ps__thumb-x {
      display: none !important;
    }
  ::v-deep .ps__rail-x {
    display: none !important;
  }
    ::v-deep .ps__rail-y {
    z-index: 100 !important;
  }
  ::v-deep .v-toolbar {
    border-radius: 0px;
    border-bottom: 1px solid rgba(72, 94, 144, 0.16);
    border-top: 0px solid rgba(72, 94, 144, 0.16);
    border-left: 0px;
    border-right: 0px;
  }

    .search-user.v-text-field ::v-deep fieldset {
    border-radius: 0px !important;
    border-bottom : 0px solid rgba(72, 94, 144, 0.16);
    border-top: 0px solid rgba(72, 94, 144, 0.16);
    border-left: 0px !important;
    border-right:1px solid #485e9029 !important;
    }
    .chat-compose-input.v-text-field ::v-deep fieldset {
    border-radius: 0px !important;
    border-bottom : 0px !important;
    border-top: 0px !important;
    border-left: 0px !important;
    border-right: 0px !important;
    }

  .chat-compose-input ::v-deep textarea {
    max-height: 7rem;
    overflow: auto;
    scrollbar-width: thin;
    bottom: 0px;
  }
  .chat-compose-input.v-text-field--outlined ::v-deep .v-input__control {
    border-radius: 0px;
    border-bottom : 0px;
    border-top: 1px solid rgba(72, 94, 144, 0.16);
    border-left: 0px;
    border-right: 0px;
  }

  .chat-compose-input.v-input--is-disabled{
    border-radius: 0px;
    border-radius: 0px;
  }
  .bubble-me {
    min-height: 20px !important;
    min-width: 100px !important;
    max-width: 70% !important;
    border-top-right-radius: 0px !important;
    border-top-left-radius: 8px !important;
    border-bottom-right-radius: 8px !important;
    border-bottom-left-radius: 8px !important;
  }
  .bubble-you {
    min-height: 20px !important;
    min-width: 100px !important;
    max-width: 70% !important;
    border-top-right-radius: 8px !important;
    border-top-left-radius: 0px !important;
    border-bottom-right-radius: 8px!important;
    border-bottom-left-radius: 8px!important;
  }
  .chat-group-divider{
    color: #949494;
    position: relative;
    display: flex;
    align-items: center;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: .5px;
    text-transform: uppercase;
    }
      .chat-group-divider::before{
    content: '';
    display: block;
    flex: 1;
    height: 1px;
    background-color: #BABABA;
    margin: 0px 20px 0px 20px;
    }
    .chat-group-divider::after{
    content: '';
    display: block;
    flex: 1;
    height: 1px;
    margin: 0px 20px 0px 20px;
    background-color: #BABABA;
    }
    .pl-10 {
    padding-left: 69px !important;
    }
    .pr-10 {
        padding-right: 69px !important;
    }
    .v-application .background {
      border-color: #485e9029 !important;
    }
@media only screen and (max-width: 960px) {
      .user-lists{
        width: 100% !important;
        z-index: 1;
    }
    .agent-panel{
      width: 100%;
    }
      .user-detail {
        position: fixed;
        width: 100%;
        height: 100%;
      }
    .user-panel{
        width: 100% !important;
        z-index: 1
    }
    .ticket-prop {
        position: fixed;
        width: 100%;
        height: 100%;
    }
    .chat-page {
      height : 100%;
      margin: 0px;
      padding: 0px;
    }
    .chat-box{
        width: 100% !important;
        z-index: 0;
        border-top-left-radius: 6px;
        border-bottom-left-radius: 6px;
    }
    .text-input-container {
    width: 100% !important;
  }
}
</style>
