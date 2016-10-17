export default class AudioExporter {
  constructor() {

  }
  encodeWAV(samples, sampleRate) {
    const buffer = new ArrayBuffer(44 + samples.length * 2)
    const view = new DataView(buffer)
    const writeString = function(view, offset, string) {
      for (let i = 0, offs = offset | 0, max = string.length | 0; i < max; i = (i + 1) | 0) {
        view.setUint8(offs + i, string.charCodeAt(i))
      }
    }
    const floatTo16BitPCM = function(output, offset, input) {
      for (let i = 0; i < input.length; i = (i + 1) | 0, offset = (offset + 2) | 0) {
        const s = Math.max(-1, Math.min(1, input[i]))
        output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true)
      }
    }
    writeString(view, 0, 'RIFF') // RIFFヘッダ
    view.setUint32(4, 32 + samples.length * 2, true) // これ以降のファイルサイズ
    writeString(view, 8, 'WAVE') // WAVEヘッダ
    writeString(view, 12, 'fmt ') // fmtチャンク
    view.setUint32(16, 16, true) // fmtチャンクのバイト数
    view.setUint16(20, 1, true) // フォーマットID
    view.setUint16(22, 1, true) // チャンネル数
    view.setUint32(24, sampleRate, true) // サンプリングレート
    view.setUint32(28, sampleRate * 2, true) // データ速度
    view.setUint16(32, 2, true) // ブロックサイズ
    view.setUint16(34, 16, true) // サンプルあたりのビット数
    writeString(view, 36, 'data') // dataチャンク
    view.setUint32(40, samples.length * 2, true) // 波形データのバイト数
    floatTo16BitPCM(view, 44, samples) // 波形データ
    return view
  }
  mergeBuffers(audioData) {
    let i, j, max, imax, jmax
    let sampleLength = 0
    for (i = 0, max = audioData.length; i < max; i = (i + 1) | 0) {
      sampleLength = (sampleLength + audioData[i].length) | 0
    }
    const samples = new Float32Array(sampleLength)
    let sampleIdx = 0
    for (i = 0, imax = audioData.length; i < imax; i = (i + 1) | 0) {
      for (j = 0, jmax = audioData[i].length; j < jmax; j = (j + 1) | 0) {
        samples[sampleIdx] = audioData[i][j]
        sampleIdx = (sampleIdx + 1) | 0
      }
    }
    return samples
  }
  exportBlob(audioData, sampleRate) {
    const dataview = this.encodeWAV(this.mergeBuffers(audioData), sampleRate)
    const audioBlob = new Blob([dataview], {
      type: 'audio/wav'
    })
    return audioBlob
  }
}
