export class NewsModel {
    private title: string;
    private content: string;
    private urlImg: string;
    private timeUp: string;
    private typeNews: string;


    constructor(data: any) {
        this.title = data?.title;
        this.content = data?.content;
        this.urlImg = data?.urlImg;
        this.timeUp = data?.timeUp;
        this.typeNews = data?.typeNews;
    }

    public get Title() { return this.title };
    public set Title(v: any) { this.title = v };

    public get Content() { return this.content };
    public set Content(v: any) { this.content = v };

    public get UrlImg() { return this.urlImg };
    public set UrlImg(v: any) { this.urlImg = v };

    public get TimeUp() { return this.timeUp };
    public set TimeUp(v: any) { this.timeUp = v };

    public get TypeNews() { return this.typeNews };
    public set TypeNews(v: any) { this.typeNews = v };
}