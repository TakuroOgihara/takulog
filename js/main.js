const firebaseConfig = {
  apiKey: "AIzaSyCsYzJ5GTaKdBCFTBIrFZ1H2Yk4EpvyuMQ",
  authDomain: "takulog0620.firebaseapp.com",
  databaseURL: "https://takulog0620.firebaseio.com",
  projectId: "takulog0620",
  storageBucket: "takulog0620.appspot.com",
  messagingSenderId: "816203676444",
};

// Initialize Firebase
const firebaseApp = firebase.initializeApp(firebaseConfig);
const app = flamelink({ firebaseApp });

const dbArticleImagePath = "flamelink/media/files";
const dbArticlePath =
  "flamelink/environments/production/content/articleThumbnail/en-US";

// 記事の表紙画像をダウンロードする
const downloadArticleImage = (articleImageLocation) =>
  firebase
    .storage()
    .ref(articleImageLocation)
    .getDownloadURL() // article-images/abcdef のようなパスから画像のダウンロードURLを取得
    .catch((error) => {
      console.error("写真のダウンロードに失敗:", error);
    });

// 記事の表紙画像を表示する
const displayArticleImage = ($divTag, url) => {
  $divTag.find(".article-item__image").attr({
    src: url,
  });
};

// 記事の表示用のdiv（jQueryオブジェクト）を作って返す
const createArticleDiv = (articleId, articleData) => {
  // HTML内のテンプレートからコピーを作成する
  const $divTag = $("#article-template > .article-item").clone();

  //記事の詳細へのリンクを付与する
  const articleUrl = articleData.url;
  console.log("articleUrl", articleUrl);
  $divTag.find(".article__url").attr({
    href: articleUrl,
  });

  //記事のタグを表示する
  const articleTag = articleData.tag[0];
  console.log("articleTag", articleTag);
  //cardクラスにarticleTagクラスを追加
  $divTag.find(".card").addClass(articleTag);

  // 記事タイトルを表示する
  $divTag.find(".article-item__title").text(articleData.title);
  console.log("記事タイトル", articleData.title);

  //記事の日付を表示する
  const articleDate = moment(articleData.date);
  $divTag.find(".article-item__date").text(articleDate.format("YYYY/MM/DD"));
  console.log("記事日付");

  //画像ID取得
  const articleImageId = articleData.imagetop[0];
  console.log("画像ID", articleImageId);

  //dbの画像パス作成
  const articleImagePath = `flamelink/media/files/${articleImageId}`;
  console.log("articleImagePath", articleImagePath);

  let imageData;
  let imageName;
  let articleImageLocation;

  // //dbから画像情報を取得
  const articleImageRef = firebase
    .database()
    .ref(articleImagePath)
    .once("value")
    .then(function (snapshot) {
      //DataSnapshotオブジェクトからデータを取得
      imageData = snapshot.val();
      console.log("imageData", imageData);
      //画像名を取得
      imageName = imageData.file;
      console.log("画像名", imageName);
      //storageの画像パスを取得
      articleImageLocation = `flamelink/media/${imageName}`;
      // 記事の表紙画像をダウンロードして表示する
      downloadArticleImage(articleImageLocation).then((url) => {
        console.log("url", url);
        displayArticleImage($divTag, url);
      });
    });

  // id属性をセット
  $divTag.attr("id", `article-id-${articleId}`);
  console.log("$divTag", $divTag);

  return $divTag;
};

// 記事一覧画面内の記事データをクリア
const resetArticlesView = () => {
  $("#article-list").empty();
};

// 記事一覧画面に記事データを表示する
const addArticle = (articleId, articleData) => {
  const $divTag = createArticleDiv(articleId, articleData);
  console.log("表示", $divTag);
  $divTag.appendTo("#article-list");
};

// 記事一覧画面の初期化、イベントハンドラ登録処理
const loadArticlesView = () => {
  resetArticlesView();

  // 記事データを取得　orderBychild("createdAt")は日付順に並び変える
  const articlesRef = firebase
    .database()
    .ref(dbArticlePath)
    .orderByChild("createdAt");
  console.log("articlesRef", articlesRef);
  // 過去に登録したイベントハンドラを削除
  articlesRef.off("child_added");

  // articles の child_addedイベントハンドラを登録
  // （データベースに記事が追加保存されたときの処理）
  articlesRef.on("child_added", (articleSnapshot) => {
    const articleId = articleSnapshot.key;
    const articleData = articleSnapshot.val();
    console.log("articleId", articleId);
    console.log("articleData", articleData);

    // 記事一覧画面に記事データを表示する
    addArticle(articleId, articleData);
  });
};

//画面を表示
loadArticlesView();

$(".nav-link").on("click", function () {
  const clickMenu = $(this).data("id");
  $(".nav-link").removeClass("active");
  $(this).addClass("active");

  // //クリックしたメニューと比較する
  if (clickMenu === "all") {
    $(".movie").parent().show();
    $(".music").parent().show();
    $(".youtube").parent().show();
    $(".store").parent().show();
    $(".blog").parent().show();
  }
  if (clickMenu === "movie") {
    $(".movie").parent().show();
    $(".music").parent().hide();
    $(".youtube").parent().hide();
    $(".store").parent().hide();
    $(".blog").parent().hide();
  }
  if (clickMenu === "music") {
    $(".movie").parent().hide();
    $(".music").parent().show();
    $(".youtube").parent().hide();
    $(".store").parent().hide();
    $(".blog").parent().hide();
  }
  if (clickMenu === "youtube") {
    $(".movie").parent().hide();
    $(".music").parent().hide();
    $(".youtube").parent().show();
    $(".store").parent().hide();
    $(".blog").parent().hide();
  }
  if (clickMenu === "store") {
    $(".movie").parent().hide();
    $(".music").parent().hide();
    $(".youtube").parent().hide();
    $(".store").parent().show();
    $(".blog").parent().hide();
  }
  if (clickMenu === "blog") {
    $(".movie").parent().hide();
    $(".music").parent().hide();
    $(".youtube").parent().hide();
    $(".store").parent().hide();
    $(".blog").parent().show();
  }
});
