const userdata = {
  id: 'userid',
  botid: 'akjhdwgau',
  name: 'username',
  gender: '',
  avatar: 'userpic',
  phone: '',
  phone1: '',
  email: '',
  email1: '',
  address: '',
  city: '',
  dob: '',
  other: '',
  nickname: '',
  sosmed: '',
  type: 'CHATBOTIKAWEBCHAT'
}
export const state = () => ({

  data: {
    tickets: {
      id: '',
      number: '',
      assign: {
        wid: '',
        agentid: '',
        departid: ''
      },
      subject: '',
      priority: '',
      category: '',
      status: '',
      statusomni: '',
      info: {},
      chat: {
        start: '',
        end: ''
      },
      process: false,
      history: []
    },
    data: {
      action: {
        xhr: false,
        open: false,
        edit: false,
        update: false,
        form: userdata
      },
      ...userdata
    },
    messages: {
      unread: 0,
      typing: false,
      last: {
        date: '2021-12-09 17:00',
        from: 'msgfrom',
        data: 'msg'
      },
      export: {
        load: false,
        data: ''
      },
      id: new Date().getTime(),
      xhr: false,
      load: false,
      prev: false,
      data: [{
        id: 'newmessage' + new Date().getTime(),
        from: 'msgfrom',
        msgid: 'dkahjwajsdwi',
        message: 'msg',
        date: '2021-12-09 17:00',
        status: 'open',
        unread: 1,
        sent: true
      }]
    },
    input: {
      process: {
        upload: false,
        sent: false
      },
      text: '',
      image: '',
      audio: '',
      video: '',
      document: ''
    },
    analytic: {
      art: ''
    },
    integration: {
      id: '',
      name: ''
    }
  }

})
