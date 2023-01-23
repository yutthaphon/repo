// ==MiruExpand==
// @name         7喜影院
// @version      v0.0.1
// @author       MiaoMint
// @lang         zh-cn
// @license      MIT
// @icon         https://www.7xi.tv/upload/site/20220630-1/f0aa6861d2399c58f87faab0f1928b10.png
// @package      dev.0n0.miru.7xi
// ==/MiruExpand==

export default class extends Expand {
    constructor() {
        super("https://www.7xi.tv/")
    }
    getCover(url) {
        if (url.indexOf("http") == -1) {
            return `https://www.7xi.tv${url}`
        }
        return url
    }

    async search(kw, page) {
        const res = await this.request(`/vodsearch/page/${page}/wd/${kw}.html`)
        const ul = res.match(/<ul class="hl-one-list([\s\S]+?)<\/ul/)[1]
        const li = ul.match(/<li([\s\S]+?)<\/li>/g)
        const bangumi = []
        li.forEach(e => {
            const title = e.match(/title="(.+?)"/)[1]
            const url = e.match(/href="(.+?)"/)[1]
            const cover = this.getCover(e.match(/data-original="(.+?)"/)[1])
            bangumi.push({
                title,
                url,
                cover
            })
        })
        return bangumi
    }
    async latest() {
        const res = await this.request("/label/rankweek.html")
        const ul = /class="hl-rank-list clearfix"([\s\S]+?)\/ul/g.exec(res)[0]
        const li = ul.match(/<li class="hl-list-item hl-col-xs-12">([\s\S]+?)<\/li>/g)
        const bangumi = []
        li.forEach(e => {
            const title = e.match(/title="(.+?)"/)[1]
            const url = e.match(/href="(.+?)"/)[1]
            const cover = this.getCover(e.match(/data-original="(.+?)"/)[1])
            bangumi.push({
                title,
                url,
                cover
            })
        })
        return bangumi
    }

    async info(url) {
        const res = await this.request(url)
        const desc = res.match(/name="description" content="(.+?)"/)[1]
        const cover = this.getCover(res.match(/data-original="(.+?)"/)[1])
        const title = res.match(/hl-dc-title hl-data-menu">(.+?)</)[1]
        const watchUrlTitleStr = res.match(/hl-plays-from hl-tabs swiper-wrapper clearfix">([\s\S]+?)<\/div>/g)[0]
        const watchUrlTitle = watchUrlTitleStr.match(/alt="(.+?)"/g)
        console.log(watchUrlTitle);
        const watchUrlGroupsStr = res.match(/id="hl-plays-list">([\s\S]+?)<\/ul/g)
        const watchurl = new Map()
        let i = 0
        watchUrlGroupsStr.forEach(e => {
            const urls = []
            let lis = e.match(/<li([\s\S]+?)<\/li>/g)
            lis.forEach(e => {
                const match = e.match(/<a href="(.+?)">(.+?)<\/a>/)
                urls.push({
                    url: match[1],
                    name: match[2],
                })
            })
            const title = watchUrlTitle[i++].split(`"`)[1]
            const groupTitle = watchurl.get(title) ? title + "1" : title
            watchurl.set(groupTitle, urls)
        })
        return {
            watchurl,
            desc,
            cover,
            title
        }
    }

    async watch(url) {
        const res = await this.request(url)
        url = res.match(/"url":"(.+?).m3u8"/)
        console.log(url);
        return {
            type: "player",
            src: `${url[1]}.m3u8`
        }
    }

}