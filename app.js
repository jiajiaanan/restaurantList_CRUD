const express = require('express')
const app = express()
const port = 3000
const exphbs = require('express-handlebars')
const mongoose = require('mongoose')
const List = require('./models/list')

//connect to MONGODB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })

// require packages used in the project
app.engine('handlebars', exphbs({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')

// setting static files
app.use(express.static('public'))

//設定 body-parser
app.use(express.urlencoded({ extended: true }))

// 取得資料庫連線狀態
const db = mongoose.connection
db.on('error', () => {
  console.log('mongodb error!')
})
db.once('open', () => {
  console.log('mongodb connected!')
})

// routes setting
//首頁路由
app.get('/', (req, res) => {
  List.find()
    .lean()
    .then(lists => res.render('index', { lists }))
    .catch(error => console.error(error))
})

//new頁面路由
app.get('/lists/new', (req, res) => {
  return res.render('new')
})

//show頁面路由
app.get('/lists/:id', (req, res) => {
  const id = req.params.id //動態路由
  return List.findById(id) //從資料庫查出資料
    .lean()
    .then((list) => res.render('show', { list }))
    .catch(error => console.log(error))
})

//edit頁面路由
app.get('/lists/:id/edit', (req, res) => {
  const id = req.params.id
  return List.findById(id)
    .lean() //把資料變成單純陣列
    .then((list) => res.render('edit', { list }))
    .catch(error => console.log(error))
})

//Create功能
app.post('/lists', (req, res) => {
  return List.create({ 
    name: req.body.name,
    name_en: req.body.name_en,
    category: req.body.category,
    image: req.body.image,
    location: req.body.location,
    phone: req.body.phone,
    google_map: req.body.google_map,
    rating: req.body.rating,
    description: req.body.description,
   })
    .then(() => res.redirect('/'))
    .catch(error => console.log(error))
})

//Update功能
app.post('/lists/:id/edit', (req, res) => {
  const id = req.params.id
  return List.findById(id) //查詢單筆資料
    .then(list => {
      list.name = req.body.name
      list.name_en = req.body.name_en
      list.category = req.body.category
      list.image = req.body.image
      list.location = req.body.location
      list.phone = req.body.phone
      list.google_map = req.body.google_map
      list.rating = req.body.rating
      list.description = req.body.description
      return list.save() //重新儲存單筆資料
    })
    .then(() => res.redirect(`/lists/${id}`)) //導向detail頁
    .catch(error => console.log(error))
})

//Delete功能
app.post('/lists/:id/delete', (req, res) => {
  const id = req.params.id
  return List.findById(id) //查詢該筆資料
    .then(list => list.remove()) //刪除該筆資料
    .then(() => res.redirect('/')) //導向根目錄頁
    .catch(error => console.log(error))
})

//搜尋功能
app.get('/search', (req, res) => {
  const keyword = req.query.keyword.toLowerCase()
  List.find()
  .lean()
  .then(lists => lists.filter(list => list.name.toLowerCase().includes(keyword) || list.category.toLowerCase().includes(keyword)))
  .then(lists => res.render('index', { lists , keyword }))
  .catch(error => console.error(error))
})



// app.get('/search', (req, res) => {
//   const keyword = req.query.keyword.toLowerCase()
//   const restaurants = restaurantList.results.filter(restaurant =>
//     restaurant.name.toLowerCase().includes(keyword) || restaurant.category.toLowerCase().includes(keyword))
//   res.render('index', { restaurants: restaurants, keyword: keyword })
// })

app.listen(port, () => {
  console.log('app.js connected')
})