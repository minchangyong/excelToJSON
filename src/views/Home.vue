/* eslint-disable */
<style lang="less">
</style>
<template>
  <div style="width: 100%;">
    <Card title="导入EXCEL">
      <Row>
        <Upload action="" :before-upload="handleBeforeUpload" accept=".xls, .xlsx">
          <Button icon="ios-cloud-upload-outline" :loading="uploadLoading" @click="handleUploadFile">上传文件</Button>
        </Upload>
      </Row>
      <Row>
        <div class="ivu-upload-list-file" v-if="file !== null">
          <Icon type="ios-stats"></Icon>
          {{ file.name }}
          <Icon v-show="showRemoveFile" type="ios-close" class="ivu-upload-list-remove" @click.native="handleRemove()"></Icon>
        </div>
      </Row>
      <Row>
        <transition name="fade">
          <Progress v-if="showProgress" :percent="progressPercent" :stroke-width="2">
            <div v-if="progressPercent == 100">
              <Icon type="ios-checkmark-circle"></Icon>
              <span>成功</span>
            </div>
          </Progress>
        </transition>
      </Row>
    </Card>
    <Row class="margin-top-10">
      <Table :columns="tableTitle" :height="300" :data="tableData" :loading="tableLoading"></Table>
    </Row>
    <Row class="margin-top-10" v-if="content">
      <Input v-model="content" :rows="10" type="textarea" placeholder="Enter something..." />
      <Button type="info" style="margin-top: 20px;" @click="copy(content)">复制</Button>
      <Button type="success" style="margin-top: 20px; margin-left: 10px;" @click="saveJSON">点击下载</Button>
    </Row>
  </div>
</template>
<script>
const excel = import('../../libs/excel')
const XLSX = import('xlsx')
export default {
  data() {
    return {
      uploadLoading: false,
      progressPercent: 0,
      showProgress: false,
      showRemoveFile: false,
      file: null,
      tableData: [],
      tableTitle: [],
      tableLoading: false,
      content: ''
    }
  },
  methods: {
    initUpload() {
      this.file = null
      this.showProgress = false
      this.loadingProgress = 0
      this.tableData = []
      this.tableTitle = []
    },
    handleUploadFile() {
      this.initUpload()
    },
    handleRemove() {
      this.initUpload()
      this.$Message.info('上传的文件已删除！')
    },
    handleBeforeUpload(file) {
      const fileExt = file.name.split('.').pop().toLocaleLowerCase()
      if (fileExt === 'xlsx' || fileExt === 'xls') {
        this.readFile(file)
        this.readExcel(file)
        this.file = file
      } else {
        this.$Notice.warning({
          title: '文件类型错误',
          desc: `文件：${file.name}不是EXCEL文件，请选择后缀为.xlsx或者.xls的EXCEL文件。`
        })
      }
      return false
    },
    // 读取文件
    readFile(file) {
      const reader = new FileReader()
      reader.readAsArrayBuffer(file)
      reader.onloadstart = () => {
        this.uploadLoading = true
        this.tableLoading = true
        this.showProgress = true
      }
      reader.onprogress = (e) => {
        this.progressPercent = Math.round((e.loaded / e.total) * 100)
      }
      reader.onerror = (e) => {
        this.$Message.error('文件读取出错', e)
      }
      reader.onload = (e) => {
        this.$Message.info('文件读取成功')
        const data = e.target.result
        const {
          header,
          results
        } = excel.read(data, 'array')
        const tableTitle = header.map((item) => ({
          title: item,
          key: item
        }))
        this.tableData = results
        this.tableTitle = tableTitle
        this.uploadLoading = false
        this.tableLoading = false
        this.showRemoveFile = true
      }
    },
    readExcel(file) {
      // 表格导入
      const fileReader = new FileReader()
      fileReader.onload = (ev) => {
        try {
          const data = ev.target.result
          const workbook = XLSX.read(data, {
            type: 'binary'
          })
          const wsname = workbook.SheetNames[0] // 取第一张表
          const ws = XLSX.utils.sheet_to_json(workbook.Sheets[wsname]) // 生成json表格内容
          this.jsonData = ws
          this.content = JSON.stringify(ws)
          return true
        } catch (e) {
          return false
        }
      }
      fileReader.readAsBinaryString(file)
    },
    copy(content) {
      this.$copyText(content).then(() => {
        this.$Message.success('复制成功')
      }, () => {
        this.$Message.error('复制失败，请手动复制')
      })
    },
    saveJSON() {
      if (!this.jsonData) {
        console.log('data is null')
        return
      }
      const filename = 'data.json'
      if (typeof this.jsonData === 'object') {
        this.jsonData = JSON.stringify(this.jsonData, undefined, 4)
      }
      const blob = new Blob([this.jsonData], {
        type: 'text/json'
      })
      const e = document.createEvent('MouseEvents')
      const a = document.createElement('a')
      a.download = filename
      a.href = window.URL.createObjectURL(blob)
      a.dataset.downloadurl = ['text/json', a.download, a.href].join(':')
      e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
      a.dispatchEvent(e)
    }
  },
  created() {

  },
  mounted() {

  }
}
</script>
