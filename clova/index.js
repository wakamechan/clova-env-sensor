const uuid = require('uuid').v4
const _ = require('lodash')
const { DOMAIN, ExtensionId } = require('../config')
var verifier = require('../util/verifier.js')
var fs = require('fs');

//ファイル読み込み関数
function readFile(path) {
  return fs.readFileSync(path, 'utf8');
}

class Directive {
  constructor({namespace, name, payload}) {
    this.header = {
      messageId: uuid(),
      namespace: namespace,
      name: name,
    }
    this.payload = payload
  }
}

class CEKRequest {
  constructor (httpReq) {
    this.request = httpReq.body.request
    this.context = httpReq.body.context
    this.session = httpReq.body.session
    console.log(`CEK Request: ${JSON.stringify(this.context)}, ${JSON.stringify(this.session)}`)
  }

  do(cekResponse) {
    switch (this.request.type) {
      case 'LaunchRequest':
        return this.launchRequest(cekResponse)
      case 'IntentRequest':
        return this.intentRequest(cekResponse)
      case 'SessionEndedRequest':
        return this.sessionEndedRequest(cekResponse)
    }
  }

  launchRequest(cekResponse) {
    console.log('launchRequest')
    cekResponse.setSimpleSpeechText('環境情報をお答えします')
    cekResponse.setMultiturn({
      intent: 'ThrowDiceIntent',
    })
  }

  intentRequest(cekResponse) {
    console.log('intentRequest')
    console.dir(this.request)
    const intent = this.request.intent.name
    const slots = this.request.intent.slots

    switch (intent) {
    case 'getEnvSensorData':
    default:
      let json = readFile("envData.json");
      let query = JSON.parse(json);
      if(query.tm) {
        cekResponse.appendSpeechText(`温度は ${query.tm} 度です`)
      }
      if(query.rh) {
        cekResponse.appendSpeechText(`湿度は ${query.rh} パーセントです`)
      }
      if(query.al) {
        cekResponse.appendSpeechText(`環境光は ${query.al} ルクスです`)
      }
      if(query.uv) {
        cekResponse.appendSpeechText(`紫外線は ${query.uv} です`)
      }
      if(query.pr) {
        cekResponse.appendSpeechText(`気圧は ${Math.round(query.pr * 10.0)} ヘクトパスカルです`)
      }
      if(query.so) {
        cekResponse.appendSpeechText(`騒音は ${query.so} デシベルです`)
      }
      break
    }

    if (this.session.new == false) {
      cekResponse.setMultiturn()
    }
  }

  sessionEndedRequest(cekResponse) {
    console.log('sessionEndedRequest')
    cekResponse.setSimpleSpeechText('環境情報のお知らせを終了します。')
    cekResponse.clearMultiturn()
  }
}

class CEKResponse {
  constructor () {
    console.log('CEKResponse constructor')
    this.response = {
      directives: [],
      shouldEndSession: true,
      outputSpeech: {},
      card: {},
    }
    this.version = '0.1.0'
    this.sessionAttributes = {}
  }

  setMultiturn(sessionAttributes) {
    this.response.shouldEndSession = false
    this.sessionAttributes = _.assign(this.sessionAttributes, sessionAttributes)
  }

  clearMultiturn() {
    this.response.shouldEndSession = true
    this.sessionAttributes = {}
  }

  setSimpleSpeechText(outputText) {
    this.response.outputSpeech = {
      type: 'SimpleSpeech',
      values: {
          type: 'PlainText',
          lang: 'ja',
          value: outputText,
      },
    }
  }

  appendSpeechText(outputText) {
    const outputSpeech = this.response.outputSpeech
    if (outputSpeech.type != 'SpeechList') {
      outputSpeech.type = 'SpeechList'
      outputSpeech.values = []
    }
    if (typeof(outputText) == 'string') {
      outputSpeech.values.push({
        type: 'PlainText',
        lang: 'ja',
        value: outputText,
      })
    } else {
      outputSpeech.values.push(outputText)
    }
  }
}

const clovaReq = function (httpReq, httpRes, next) {
  const signature = httpReq.headers.signaturecek
  cekResponse = new CEKResponse()
  cekRequest = new CEKRequest(httpReq)
  try{
    //verifier(signature, ExtensionId, JSON.stringify(httpReq.body))
  }catch(e){
    return httpRes.status(400).send(e.message)
  }
  cekRequest.do(cekResponse)
  console.log(`CEKResponse: ${JSON.stringify(cekResponse)}`)
  return httpRes.send(cekResponse)
};

module.exports = clovaReq;
