<template>
  <v-row justify="center" align="center" class="chat-page fill-height" style="height:100vh;">
    <v-col cols="12" sm="12" md="12" style="height : 100%; position: absolute" class="pa-0">
      <v-row no-gutters class="chat-system" style="height : 100%;">
        <v-slide-x-transition>
          <div v-if="!mobile || userListShow" class="d-flex user-panel userList">
            <div style="padding: 0px; position: inline;display:grid" class="inputbg bdColor--border">
              <v-text-field
                v-model="search"
                height="59px"
                clearable
                outlined
                hide-details
                class="search-user"
                placeholder="Search user"
                style="width: 100%;"
              />
            </div>
            <perfect-scrollbar infinite-wrapper class="d-flex mb-3 flex-column user-lists">
              <v-list>
                <v-list-item-group>
                  <v-list-item
                    v-for="(item, i) in returnFilteredUser"
                    :key="item.data.id"
                    v-ripple="false"
                    dense
                    :active-class="$vuetify.theme.dark ? 'list-active-dark' : 'list-active'"
                    class="pa-0 lighten-2"
                    @click="getUser(item.data.id)"
                  >
                    <v-badge
                      avatar
                      overlap
                      color="white"
                      offset-x="24px"
                      offset-y="24px"
                    >
                      <template #badge>
                        <v-avatar>
                          <v-img :src="require(`~/assets/icons/${chatType[item.data.type] !== undefined ? chatType[item.data.type].image : 'qmark'}.png`)" />
                        </v-avatar>
                      </template>

                      <v-list-item-avatar :style="[ item.tickets.status === 'hold' ? {'border' : '2px solid #707070', 'border-spacing' : '80px'} : {}]" size="40">
                        <v-img :src="item.data.avatar !== null ? item.data.avatar : imageLoadOnError(i)" @error="imageLoadOnError(i)" />
                      </v-list-item-avatar>
                    </v-badge>

                    <v-list-item-content>
                      <v-list-item-title class="font-weight-medium primary--text" style="font-size: 0.875rem;" v-text="item.data.name.length > 0 ? item.data.name : item.data.id" />
                      <v-list-item-subtitle class="text--secondary" v-text="item.messages.last.data.text" />
                    </v-list-item-content>
                    <v-list-item-action>
                      <v-list-item-action-text
                        class="mr-4 text--secondary"
                        style="font-size: 0.6rem"
                        v-text="$moment(item.messages.last.date ).calendar({
                          sameDay: 'HH:mm',
                          lastDay: '[Yesterday]',
                          lastWeek: 'dddd',
                          sameElse: 'DD/MM/YYYY'
                        })"
                      />
                      <v-badge
                        v-show="item.messages.unread"
                        class="mr-4"
                        dot
                        inline
                        color="red"
                      />
                    </v-list-item-action>
                  </v-list-item><infinite-loading ref="userListLoading" :identifier="infiniteIdentifier" />
                </v-list-item-group>
              </v-list>
            </perfect-scrollbar>
            <v-row class="agent-panel">
              <v-list-item
                v-ripple="false"
                dense
              >
                <v-list-item-avatar size="36">
                  <v-img :src="state.user.profile" />
                </v-list-item-avatar>

                <v-list-item-content>
                  <v-list-item-title class="primary--text font-weight-medium" v-text="state.user.profile" />
                </v-list-item-content>
                <v-list-item-action-text class="mr-4">
                  <v-icon
                    inline
                    color="grey"
                    @click="microphone = !microphone"
                  >
                    {{ microphone ? 'mdi-microphone-outline' : 'mdi-microphone-off' }}
                  </v-icon>
                  <v-icon
                    class="ml-2"
                    inline
                    color="grey"
                  >
                    mdi-cog-outline
                  </v-icon>
                </v-list-item-action-text>
              </v-list-item>
            </v-row>
          </div>
        </v-slide-x-transition>
        <ChatConsole :is="showConsole" :current-chat="currentUser" :user-exist="userExist" :show-chat="showChat" />
        <!-- <div :style="[(userDetail || ticketProp) && toggleChat? {'width' : 'calc(100% - 500px)'} : {'width' : 'calc(100% - 250px)'}]" class="d-flex chat-box">
          <v-row v-if="isCurrentUserExist && toggleChat && !userListShow" align="start" style="width: 100%; " class="no-margin inputbg">
            <v-toolbar height="60px" flat tile>
              <v-btn v-show="mobile" class="secondary--text" icon @click="userListShow = !userListShow">
                <v-icon>mdi-chevron-left</v-icon>
              </v-btn>
              <v-avatar size="36" style="cursor: pointer;" @click="userDetail = !userDetail; ticketProp = false">
                <v-img
                  :src="currentUser.data.avatar"
                />
              </v-avatar>
              <v-toolbar-title style="font-size: 0.875rem !important;" class="ml-5 primary--text font-weight-medium">
                {{ currentUser.data.name ? currentUser.data.name : currentUser.data.id }}
                <div v-if="currentUser.data.connected && currentUser.data.connected.url && currentUser.data.connected.name" class="caption">
                  From <a target="_blank" :href="currentUser.data.connected.url">{{ currentUser.data.connected.name }}</a>
                </div>
              </v-toolbar-title>
              <v-spacer />
              <v-tooltip v-if="currentUser.tickets.info" bottom>
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
                      :value="currentUser.tickets.info && currentUser.tickets.info.note && currentUser.tickets.info.note.length > 0"
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
        </v-slide-x-reverse-transition> -->
      </v-row>
    </v-col>
    <v-dialog
      v-if="isCurrentUserExist && currentUser.tickets.info"
      v-model="noteDialog"
      scrollable
      transition="false"
      max-width="600"
      hide-overlay
      content-class="elevation-0"
    >
      <v-card outlined>
        <v-toolbar
          flat
          height="60px"
          tile
          dense
          dark
          class="nav"
        >
          <v-toolbar-title>Ticket Notes</v-toolbar-title>
          <v-spacer />
          <v-btn icon @click="noteDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text style="height: 300px; scrollbar-width: thin;">
          <v-container>
            <v-card
              v-for="(note, i) in currentUser.tickets.info.note"
              :key="i"
              flat
              outlined
              class="mb-2 accent"
            >
              <v-card-text class="pa-1">
                <div class="pa-1 d-inline-block" rounded>
                  <span style="font-weight: 600" class="text-primary">{{ note.agent }},</span>
                  <span class="text-secondary" style="font-size : 80% !important">{{ humanTime(note.time, true, true, true, false) }}</span>
                </div>
                <div class="pa-1">
                  {{ note.text }}
                </div>
              </v-card-text>
            </v-card>
            <v-textarea
              v-model="newNote"
              rows="6"
              row-height="15"
              outlined
              hide-details
              auto-grow
              placeholder="type a note"
            />
          </v-container>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            text
            class="nav"
            color="white"
            @click="pushNote"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-if="isCurrentUserExist"
      v-model="contactDialog"
      scrollable
      transition="false"
      max-width="600"
      hide-overlay
      content-class="elevation-0"
    >
      <v-card outlined>
        <v-toolbar
          flat
          height="60px"
          tile
          dense
          dark
          class="nav"
        >
          <v-toolbar-title>Add To Contact</v-toolbar-title>
          <v-spacer />
          <v-btn icon @click="contactDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-stepper v-model="saveContact.step">
          <v-stepper-items>
            <v-stepper-content step="1">
              <v-card
                class="pa-2"
                flat
              >
                <v-row style="height: 100%">
                  <v-col cols="6" class="d-flex justify-center align-center">
                    <v-btn class="nav" deppresed dark @click="saveContact.step = 2">
                      Add New
                    </v-btn>
                  </v-col>
                  <v-col cols="6" depressed class="d-flex justify-center align-center">
                    <v-btn>Add To existing</v-btn>
                  </v-col>
                </v-row>
              </v-card>
            </v-stepper-content>

            <v-stepper-content step="2">
              <v-form
                ref="form"
                v-model="validUser"
              >
                <v-card
                  flat
                >
                  <v-card-text>
                    <v-row>
                      <v-col cols="4">
                        <input type="file" accept=".png, .jpg, .jpeg" @change="uploadContactImage">
                        <v-badge
                          bordered
                          icon="mdi-pencil-outline"
                          bottom
                          size="40"
                          color="grey"
                          offset-x="36"
                          offset-y="36"
                        >
                          <v-avatar size="160">
                            <v-img :src="currentUser.data.action.form.avatar" />
                          </v-avatar>
                        </v-badge>
                      </v-col>
                      <v-col cols="8">
                        <v-label class="mb-3">
                          User Information
                        </v-label>
                        <v-text-field
                          v-model="currentUser.data.action.form.name"
                          class="mt-5"
                          outlined
                          dense
                          label="Name"
                          required
                        />
                        <v-label class="mb-3">
                          Contact Information
                        </v-label>
                        <v-text-field
                          v-model="currentUser.data.action.form.phone"
                          class="mt-5"
                          dense
                          outlined
                          label="Phone Number"
                          required
                        />
                        <v-text-field
                          v-model="currentUser.data.action.form.email"
                          outlined
                          dense
                          label="E-mail"
                          required
                        />
                      </v-col>
                    </v-row>
                  </v-card-text>
                  <v-divider />
                  <v-card-actions class="d-flex justify-end mt-3">
                    <v-btn
                      depressed
                      color="success"
                      class="mr-4"
                    >
                      Save
                    </v-btn>
                    <v-btn
                      text
                      class="mr-4"
                    >
                      Cancel
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-form>
            </v-stepper-content>

            <v-stepper-content step="3">
              <v-card
                class="mb-12"
                color="grey lighten-1"
                height="200px"
              />

              <v-btn
                color="primary"
                @click="e1 = 1"
              >
                Continue
              </v-btn>

              <v-btn text>
                Cancel
              </v-btn>
            </v-stepper-content>
          </v-stepper-items>
        </v-stepper>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
// import Velocity from 'velocity-animate'
import 'viewerjs/dist/viewer.css'
import { directive as viewer } from 'v-viewer'
import chatType from '~/assets/chat_type.json'
import blankProfile from '~/assets/images/blank_profile.png'
import imageLoad from '~/assets/images/image-preview.png'
import botAvatar from '~/assets/images/bot.png'
import chatConsole from '~/components/ChatConsole.vue'
// import users from '~/assets//data.json'
export default {
  name: 'ChatsPage',
  directives: {
    viewer: viewer({
      debug: false
    })
  },
  layout: 'app',
  props: {
    showChat: {
      type: Object,
      default: () => {}
    }
  },
  data () {
    return {
      playerOpt: {
        controls: [
          'download', 'play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'
        ]
      },
      fileUploadLoading: false,
      imageShow: false,
      viewerOptions: {
        toolbar: false,
        navbar: false,
        title: false,
        moveable: false,
        rotateable: false
      },
      settings: {
        suppressScrollX: true
      },
      newChat: '',
      validUser: false,
      newNote: '',
      assignTo: null,
      search: '',
      microphone: false,
      listKey: 0,
      blankProfile,
      imageLoad,
      userListShow: false,
      toggleChat: false,
      userDetail: false,
      ticketProp: false,
      userIndex: null,
      chatBoxWidth: '70%',
      chatType,
      counter: 0,
      persons:
            {
              active: '',
              id: +new Date(),
              id2: +new Date(),
              xhr: false,
              filter: {
                search: '',
                ticketstatus: [],
                messagedate: '',
                messageunreplied: '',
                messagestatus: '',
                channel: '',
                tag: []
              },
              data: [
                {
                  tickets: {
                    id: 'hdtbiycs34kyoj56dm9lg35ee',
                    number: '1',
                    assign: { wid: 'worktwbyxncxgp', agentid: 'utarjg2wa7n', departid: '' },
                    subject: '',
                    priority: 'high',
                    category: 'Aneh',
                    status: 'unsolved',
                    statusomni: 'open',
                    info: { tag: ['Nganu', 'Nganu2'], note: '' },
                    chat: { start: '63dd0c3c93fc53b', end: 'e3fb7d0dce5d40a' },
                    process: false,
                    history: [{ id: 'hdtbiycs34kyoj56dm9lg35ee', status: 'unsolved', priority: 'high', date: '2022-01-18 13:46:54', number: '1' }],
                    new: true
                  },
                  data: { action: { xhr: false, open: false, edit: false, update: false, form: { id: 'rlnopSF0WWUdeiSTb', botid: 'biycs34kyoj5', name: '', gender: '', avatar: 'https://botmaster2.botika.online/platform/images/user.png', phone: '', phone1: '', email: '', email1: '', address: '', city: '', dob: '', other: '', nickname: '', sosmed: { sosmedfb: '', sosmedig: '', sosmedtw: '' }, type: 'CHATBOTIKAWEBCHAT', connected: { url: 'https://chat.botika.online/CAae8ff', name: 'Webchat Omni' } } }, id: 'rlnopSF0WWUdeiSTb', botid: 'biycs34kyoj5', name: '', gender: '', avatar: 'https://botmaster2.botika.online/platform/images/user.png', phone: '', phone1: '', email: '', email1: '', address: '', city: '', dob: '', other: '', nickname: '', sosmed: { sosmedfb: '', sosmedig: '', sosmedtw: '' }, type: 'CHATBOTIKAWEBCHAT', connected: { url: 'https://chat.botika.online/CAae8ff', name: 'Webchat Omni' } },
                  messages: { unread: 0, typing: false, last: { date: '2022-01-26 17:24:25', from: 'Admin', data: [{ text: 'daw' }] }, export: { load: false, data: '' }, id: 1643262539, xhr: false, load: false, prev: false, prevclick: false, data: [{ id: '6ffa4ec110ca067', msgid: '61f0e95eee9f500614465118', message: [{ text: 'rawr' }], date: '2022-01-26 13:25:36', from: 'User', status: 'Sent', statusdetail: null, unread: 0, sent: 'true', replyfrom: '' }, { id: 'a4b25e6aa7a2b5e', msgid: 'm3f338f33f', message: [{ id: 'm3f338f33f', type: 'text', text: 'Thank you for sending a message. We are sorry that our agent is currently offline. We will reply to your message as soon as possible!' }], date: '2022-01-26 13:25:36', from: 'Bot', status: 'Sent', statusdetail: null, unread: 0, sent: 'true', replyfrom: '' }] },
                  input: { process: { upload: false, sent: false }, text: '', image: '', audio: '', video: '', document: '' },
                  analytic: { art: '' },
                  integration: { id: 'cht7o4i1f8g37', name: 'Webchat Omni' }
                }],
              datalength: 0,
              childContact: {},
              childContactLoading: false
            },
      pages: 1,
      noteDialog: false,
      inputFile: null,
      socket: null,
      contactDialog: false,
      saveContact: {
        step: 1
      }
    }
  },
  computed: {
    state () {
      return {
        user: {
          id: 'utarjg2wa7n',
          username: 'luky011',
          name: 'Luky Shaw',
          profile: botAvatar,
          email: 'luzion1508+11@gmail.com',
          phone: '+6287839300405',
          token: 'qnsal2-tymz-1d9tlpe2qzlz1eie-j00aglgykj-e17n7nlu'
        },
        workspace: {
          idx: 1,
          id: 'workzimuny2fuz',
          name: 'workspace_9apchs',
          roleid: 'rlaccidv3m3moo7r',
          role: 'Administrator',
          departid: null,
          botid: 'bjg0ilj7qrzk'
        },
        tags: ['Nganu', 'Nganu2', 'Nganu3'],
        priority: ['problem', 'warning', 'high', 'medium'],
        category: ['Aneh', 'Ajaib', 'Step sister', 'lucky guy'],
        coworker: ['Agent 2', 'Agent 3', 'Agent 4']
      }
    },
    authUser () {
      return { result: 'success', user: { id: 'utarjg2wa7n', username: 'luky011', name: 'Luky Shaw', profile: 'https://localhost/omni/assets/img/user.png', email: 'luzion1508+11@gmail.com', phone: '+6287839300405', token: 'qnsal2-tymz-1d9tlpe2qzlz1eie-j00aglgykj-e17n7nlu', jwt: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJkYXRhIjp7ImFjY291bnRfaWQiOiJ1dGFyamcyd2E3biIsInVzZXJuYW1lIjoibHVreTAxMSIsInNvdXJjZV9pZCI6IkJvdGlrYSBPbW5pY2hhbm5lbCIsInJvb20iOiJxbnNhbDItdHltei0xZDl0bHBlMnF6bHoxZWllLWowMGFnbGd5a2otZTE3bjdubHUifSwiaWF0IjoxNjQzMjYyNDg0LCJpc3MiOiJsb2NhbGhvc3QiLCJuYmYiOjE2NDMyNjI0ODQsImV4cCI6MTY0MzMxMjg4NH0.C1KU6vlfE_wAX-wnC8hwcnOj8bT827WDOu8MffJ6dlgb6_8qT0cE12bYqGnDgsYOGumb3Msa2yghwFeWGFtSgQ' }, workspace: { idx: 1013, id: 'worktwbyxncxgp', name: 'workspace_xr4pfx', roleid: 'rlacciddl53qwbg1', role: 'Administrator', departid: null, botid: 'biycs34kyoj5' } }
    },
    showConsole () {
      return chatConsole
    },
    infiniteIdentifier () {
      if (this.search === null || this.search.length === 0) {
        return +new Date()
      } else {
        return this.search
      }
    },
    currentUser () {
      if (this.isCurrentUserExist) {
        return this.persons.data[this.userIndex]
      } else {
        return {}
      }
    },
    translateXVal () {
      if (this.mobile) {
        return { me: '-155px', you: '155px' }
      } else {
        return { me: '-175px', you: '175px' }
      }
    },
    mobile () {
      return this.$vuetify.breakpoint.sm || this.$vuetify.breakpoint.xs
    },
    isCurrentUserExist () {
      if (this.userIndex !== null && this.userIndex !== undefined) {
        return Boolean(this.persons.data[this.userIndex] && Object.keys(this.persons.data[this.userIndex]).length >= 1 && Object.getPrototypeOf(this.persons.data[this.userIndex]) === Object.prototype)
      } else {
        return false
      }
    },
    returnFilteredUser () {
      if (this.search !== null && this.search.length > 0) {
        return this.persons.data.filter((item) => {
          return this.search.toLowerCase().split(' ').every(v => item.name.toLowerCase().includes(v))
        })
      } else {
        return this.persons.data
      }
    }
  },
  created () {
    this.item = []
    // this.initialReq()
    // this.simulateNewChat()
  },
  methods: {
    IsJsonString (str) {
      try {
        JSON.parse(str)
      } catch (e) {
        return str
      }
      return JSON.parse(str).jwt
    },
    socketUser (response) {
      const userid = response.userId
      const botid = response.botId
      const chattype = response.type

      const check = this.persons.data.findIndex(p => p.data.id === userid && p.data.type === chattype && p.data.botid === botid)
      if (check >= 0) {
        Object.keys(response).forEach((key) => {
          console.log(key, response[key])
        })
        // $.each(response, (i, v) => {
        //   if (i in this.persons.data[check].data) { this.persons.data[check].data[i] = v }
        //   if (i in this.persons.data[check].data.action.form) { this.persons.data[check].data.action.form[i] = v }
        // })
      }
    },
    getFilename (url) {
      return (url) ? url.split('/').pop().replace(/%20/g, ' ') : ''
    },
    downloadFile (url) {
      const popUp = window.open(url)
      if (popUp == null || typeof (popUp) === 'undefined') {
        alert('Please Allow Pop up.')
      }
    },
    // manualLoad () {
    //   this.distance = false
    //   this.$nextTick(() => {
    //     this.$refs.userListLoading.attemptLoad()
    //   })
    // },
    imageLoadOnError (i) {
      this.persons.data[i].data.action.avatar = blankProfile
    },
    scrollToEnd () {
      const objDiv = document.getElementById('chat-window')
      if (objDiv) {
        this.$nextTick(() => {
          objDiv.scrollTop = objDiv.scrollHeight
        })
      }
    },
    nl2br (str, _isXhtml) {
      return (str).replace(/\r?\n|\r/g, '<BR>')
    },
    newline () {
      this.currentUser.input.text = `${this.currentUser.input.text}\n`
    },
    replaceUrl (content) {
      const satisfactionMatch = /(\b(https:?|):\/\/omni.botika.online\/satisfaction[-A-Z0-9+&@#\\/%?=~_|!:,.;]*[-A-Z0-9+&@#\\/%=~_|])/ig
      content = content.replace(satisfactionMatch, '<b> (only visible to user)</b>')

      const expMatch = /(\b(https?|):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#\\/%=~_|])/ig
      const elementContent = content.replace(expMatch, "<a href='$1' target='_blank' onclick='window.open(`$1`, `_blank`)'>$1</a>")
      const newExpMatch = /(^|[^\\/])(www\.[\S]+(\b|$))/gim
      const newContent = elementContent.replace(newExpMatch, '$1<a href="http:\\/\\/$2" target="_blank" onclick="window.open(`http:\\/\\/$2`, `_blank`)">$2</a>')
      return this.filterXSS(newContent)
    },
    filterXSS (str) {
      return (str)
    },
    stripHtml (html) {
      const tmp = document.createElement('DIV')
      tmp.innerHTML = html
      return tmp.textContent || tmp.innerText || ''
    },
    br2nl (str, replaceMode) {
      if (!str) { return '' }
      const replaceStr = (replaceMode) ? '\n' : ''
      // Includes <br>, <BR>, <br />, </br>
      // eslint-disable-next-line no-useless-escape
      return str.replace(/<\s*\/?br\s*[\/]?>/gi, replaceStr)
    },
    uploadContactImage () {

    },
    getUser (id) {
      console.log(this.userIndex, id)
      this.userListShow = false
      if (this.userIndex === null) {
        setTimeout(() => {
          console.log('scroll')
          this.scrollToEnd()
        }, 1000)
        this.userIndex = this.persons.data.findIndex((item) => {
          return item.data.id === id
        })
        this.currentUser.messages.unread = false
        this.toggleChat = true
      } else if (this.isCurrentUserExist && this.currentUser.data !== undefined && (this.currentUser.data.id === null || this.currentUser.data.id === id)) {
        this.currentUser.messages.unread = false
        this.toggleChat = !this.toggleChat
        console.log('2', this.currentUser.data.id, id)
      } else if (this.isCurrentUserExist && this.currentUser.data.id !== id) {
        console.log('3', this.currentUser.data.id, id)
        setTimeout(() => {
          this.scrollToEnd()
        }, 1000)
        this.userIndex = this.persons.data.findIndex((item) => {
          return item.data.id === id
        })
        this.currentUser.messages.unread = false
        this.toggleChat = true
      }
    },

    pushChat () {
      if (this.persons.data[this.userIndex].messages.data !== undefined && this.currentUser.input.text.length > 0) {
        this.persons.data[this.userIndex].messages.data.push({ from: 'Admin', message: [{ text: this.nl2br(this.currentUser.input.text) }], date: this.$moment().format('Y-MM-DD HH:mm'), sent: false })
        this.persons.data.splice(0, 0, this.persons.data.splice(this.userIndex, 1)[0])
        this.userIndex = 0
        this.persons.data[this.userIndex].messages.unread = 0
        this.currentUser.input.text = ''
        this.scrollToEnd()
        // this.persons.data[this.userIndex].chats.push({ from: 'me', message: this.nl2br(this.newChat), time: this.$moment().format('Y-MM-DD HH:mm'), chat_log_id: Math.random().toString(36).slice(2) })
      }
    },
    humanTime (time, full, day, chat) {
      const today = this.$moment().format('Y-MM-DD')
      const today2 = this.$moment(time, 'Y-MM-DD HH:mm').format('Y-MM-DD')
      const startOfWeek = this.$moment().startOf('isoWeek').format('Y-MM-DD')
      if (today === today2 || chat) {
        return this.$moment(time, 'Y-MM-DD HH:mm').format(full ? '[Today] HH:mm' : day ? '[Today]' : 'HH:mm')
      } else if (this.$moment(time, 'Y-MM-DD HH:mm').diff(this.$moment(), 'days') === -1) {
        return this.$moment(time, 'Y-MM-DD HH:mm').format(full ? '[Yesterday] HH:mm' : '[Yesterday]')
      } else if (today2 >= startOfWeek) {
        return this.$moment(time, 'Y-MM-DD HH:mm').format(full ? 'dddd HH:mm' : 'dddd')
      } else {
        return this.$moment(time, 'Y-MM-DD HH:mm').format(full ? 'DD MMM HH:mm' : 'DD MMM')
      }
    },
    setDivider (x, i) {
      if (this.currentUser.messages.data[i - 1]) {
        const a = this.$moment(this.currentUser.messages.data[i - 1].date, 'Y-MM-DD HH:mm').format('Y-MM-DD')
        const b = this.$moment(x, 'Y-MM-DD HH:mm').format('Y-MM-DD')
        if (a !== b) {
          return true
        } else {
          return false
        }
      } else if (i === 0) {
        return true
      }
    },
    showAvatar (i) {
      if (this.currentUser.messages.data[i - 1]) {
        if (this.currentUser.messages.data[i - 1].from === this.currentUser.messages.data[i].from) {
          return false
        } else {
          return true
        }
      } else if (i === 0) {
        return true
      }
    },
    pushNote () {
      if (this.newNote !== null && this.newNote.length > 0) {
        this.persons.data[this.userIndex].ticket.note.push({ agent: this.state.user.name, text: this.newNote, time: this.$moment().format('Y-MM-DD HH:mm') })
        this.newNote = ''
      }
    }
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
