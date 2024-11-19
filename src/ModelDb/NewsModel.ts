export class NewsModel {
    private title: string;
    private content: string;
    private urlImg: string;

    constructor(data: any) {
        this.title = data.title;
        this.content = data.content;
        this.urlImg = data.urlImg;
    }

    public get Title() { return this.title };
    public set Title(v: any) { this.title = v };

    public get Content() { return this.content };
    public set Content(v: any) { this.content = v };

    public get UrlImg() { return this.urlImg };
    public set UrlImg(v: any) { this.urlImg = v };
}