import HomePage from "../pages/home.jsx";
import IntroPage from "../pages/intro.jsx";
import NotFoundPage from "../pages/404.jsx";
import LoginPage from "../pages/users/sessions/new.jsx";
import SignUpPage from "../pages/users/registrations/new.jsx";
import BasketPage from "../pages/Basket.jsx";
import ContactsPage from "../pages/Contacts.jsx";
import MyPage from "../pages/My.jsx";
import ItemInfo from "../pages/ItemInfo.jsx";
import WritePage from "../pages/Write.jsx";
import AdminPage from "../pages/Admin.jsx";
import CreateItemPage from "../pages/CreateItem.jsx";
import ConfigTagPage from "../pages/ConfigTag.jsx";
import SearchPage from "../pages/Search.jsx";
import BellPage from "../pages/bell.jsx";
import CashPage from "../pages/cash.jsx";
import ConfigPwPage from "../pages/configPw.jsx";
import DeleteUserPage from "../pages/DeleteUser.jsx";
import DeleteItemPage from "../pages/DeleteItem.jsx";
import SortCategoryPage from "../pages/SortCategory.jsx";
import LoadingPage from "../pages/loading.jsx";
import LoadingFailPage from "../pages/loadingFail.jsx";

const routes = [
  { path: "/", component: HomePage },
  { path: "/my", component: MyPage },
  { path: "/config-tag", component: ConfigTagPage },
  { path: "/bell", component: BellPage },
  { path: "/basket", component: BasketPage },
  { path: "/contacts", component: ContactsPage },
  { path: "/search", component: SearchPage },
  { path: "/users/sign_in", component: LoginPage },
  { path: "/users/sign_up", component: SignUpPage },
  { path: "/item-info/:id", component: ItemInfo },
  { path: "/category", component: SortCategoryPage },
  { path: "/write", component: WritePage },
  { path: "/admin", component: AdminPage },
  { path: "/cash", component: CashPage },
  { path: "/delete-user", component: DeleteUserPage },
  { path: "/config-pw", component: ConfigPwPage },
  { path: "/admin/create-item", component: CreateItemPage },
  { path: "/admin/delete-item", component: DeleteItemPage },
  { path: "/success", component: LoadingPage },
  { path: "/fail", component: LoadingFailPage },
  { path: "(.*)", component: NotFoundPage },
];

export default routes;
