import { ipcRenderer } from 'electron'
import { VideoSplitterAPI } from '../../../type/API/VideoSplitter'

export const VideoSplitterExpose: () => VideoSplitterAPI = () => {
  return {
    UpLoadVideo: async () => {
      return await ipcRenderer.invoke('upload-video')
    }
  }
}
