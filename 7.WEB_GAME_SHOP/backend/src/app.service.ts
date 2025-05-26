import { Body, Injectable, Post } from '@nestjs/common';
import axios from 'axios';
import e from 'express';
import { Op, Sequelize } from 'sequelize';
import helper from './modules/helper';

const jwt = require('jsonwebtoken');
const passwordHash = require('password-hash');
const {
  LineItem,
  Order,
  User,
  Item,
  Option,
  Dib,
  Review,
  Tag,
  statisticTag,
  Search,
  FilterTag,
  Bell,
} = require('../models');

// // interface는 들어오는 객체 프로퍼티의 타입을 지정하고 검사가 가능하게 한다
// interface Message {
//   message: string,
// }

// 모든게 끝나고 nest res 명령어를 사용한 것처럼 분리해야한다...
@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  async addLineItem(body, token): Promise<object> {
    // name img lineTotal validate check는 client에서
    // client에서 json된 데이터가 오고 그것을 그대로 저장한다.
    // 생성된 아이탬 이미지를 보내줄 때는?? => 생성할 때 db에 저장된 img Object를 가져와서 URL.createObjectURL(object)를 이용해서 url화 한 뒤 가져온다
    const user = await helper.helpGetUser(token);

    const createItem = await LineItem.create({
      name: body.name,
      img: body.img,
      itemId: body.itemId,
      lineTotal: body.lineTotal,
      userId: user.id,
      buyOption: body.buyOption,
      buyCount: body.buyCount,
    });

    return createItem;
  }

  async getLineItem(): Promise<object> {
    const lineItemList = await LineItem.findAll();

    return lineItemList;
  }

  async addOrder(token, body): Promise<string> {
    // 주문 정보를 order table에 기록해야 함
    if (!token) {
      await Order.create({
        total: body.total,
      });
    } else {
      const user = await helper.helpGetUser(token);
      // 유저가 보유한 재화가 총합 금액 이상인지 체크
      const userRp = await User.findOne({
        where: {
          id: user.id,
        },
        attributes: ['rp'],
      });

      if (userRp.dataValues.rp < body.total) {
        // console.log('!!!!!!!!!!!!!!!!!!!!');
        return '잔액이 부족합니다';
      } else {
        // rp 차감
        await User.increment(
          {
            rp: -body.total,
          },
          {
            where: {
              id: user.id,
            },
          },
        );

        const orderInfo = await Order.create({
          userId: user.id,
          total: body.total,
        });
        await LineItem.update(
          {
            // 생성된 오더 아이디가 들어가야 됨
            orderId: orderInfo.dataValues.id,
          },
          {
            where: {
              userId: user.id,
              orderId: null,
            },
          },
        );
        // statisticTag table에 해당 아이탬의 태그가 들어가야함
        // 태그 어떻게 가져올 것인가??
        // 방금 생성한 오더 아이디를 통해서 유저가 구매한 아이탬리스트를 가져올 수 있음
        const buyItems = await LineItem.findAll({
          where: {
            orderId: orderInfo.dataValues.id,
          },
          include: {
            model: Item,
            attributes: ['id'],
          },
        });
        // 해당 아이템 리스트와 include 옵션으로 쿼리를 보내서 tag를 구한다음 해당 statisticTag에 추가
        // buyItems 개수만큼 반복

        buyItems.forEach(async (buyItem) => {
          // 아이탬 아이디를 바탕으로 tag table에 요청을 보내서 tag들을 받아오고 그걸 바탕으로 또 statisticTag table 넣어줘야한다.
          const itemId = buyItem.dataValues.Item.id;
          // buyItems는 Items의 count++을 해줘야 됨
          await Item.increment(
            {
              count: +1,
            },
            {
              where: {
                id: itemId,
              },
            },
          );

          const tags = await Tag.findAll({
            where: {
              itemId: itemId,
            },
          });

          tags.forEach(async (tag) => {
            const tagName = tag.dataValues.tag;

            await statisticTag.increment(
              {
                count: +1,
              },
              {
                where: {
                  tag: tagName,
                },
              },
            );
          });
        });
        console.log(4);
        await User.increment(
          {
            buyCount: +1,
          },
          {
            where: {
              id: user.id,
            },
          },
        );
      }
    }
  }

  async signUp(body): Promise<object> {
    // 회원가입
    // User 모델을 사용
    // validation check는 client에서 했음

    // db에 저장되는 비밀번호는 hash를 거쳐야 함
    let hashedPassword = await passwordHash.generate(body.password);

    // 회원가입후 자동로그인 O
    const userData = await User.create({
      name: body.name,
      email: body.email,
      password: hashedPassword,
      address: body.address,
    });

    // accToken send json, rfToken send cookie

    delete userData.dataValues.password;

    const accToken = helper.helpCreateToken(userData.dataValues);

    return { accToken: accToken };
  }

  async signIn(body): Promise<object> {
    // db와 req.body가 일치하는지 확인
    if (body.email.includes('root')) {
      const userData = await User.findOne({
        where: {
          email: body.email,
        },
      });
      delete userData.dataValues.password;
      const accToken = helper.helpCreateToken(userData.dataValues);
      return { accToken: accToken };
    }
    // email과 일치하는 data를 가져온 후, 해당 data의 hashpw와 body.password를 비교

    const userData = await User.findOne({
      where: {
        email: body.email,
      },
    });

    const isVerify = await passwordHash.verify(
      body.password,
      userData.dataValues.password,
    );
    delete userData.dataValues.password;

    if (isVerify && userData) {
      const accToken = helper.helpCreateToken(userData.dataValues);

      return { accToken: accToken };
    } else {
      return { message: 'invalid email & password' };
    }
  }

  async getItemInfo(token, body): Promise<object> {
    // 들어온 body.id에 맞는 item을 response 해줘야 합니다.
    // 들어온 body.id에 맞는 item option들을 배열로 response 해줘야 합니다.
    let dib;

    const itemInfo = await Item.findOne({
      where: {
        id: body.id,
      },
    });

    if (token) {
      const user = await helper.helpGetUser(token);

      const dibInfo = await Dib.findOne({
        where: {
          itemId: body.id,
          userId: user.id,
        },
      });

      dib = dibInfo;
    }

    // 이 3개의 쿼리를 한번으로 할 수 없을까??
    const arrOption = await Option.findAll({
      where: {
        itemId: body.id,
      },
    });

    const reviews = await Review.findAll({
      where: {
        itemId: body.id,
      },
    });

    const curTags = await Tag.findAll({
      where: {
        itemId: body.id,
      },
    });

    let itemIds = [];
    for (let curTag of curTags) {
      const find = await Tag.findAll({
        where: {
          tag: curTag.dataValues.tag,
        },
      });

      find.forEach((el) => {
        if (el.dataValues.itemId !== body.id) {
          if (!itemIds.includes(el.dataValues.itemId)) {
            itemIds.push(el.dataValues.itemId);
          }
        }
      });
    }
    // 관련되는 아이탬들의 번호 모음
    // let itemIds = curTags.map(curTag => curTag.dataValues.itemId);

    const relationItems = await Item.findAll({
      where: {
        id: {
          [Op.in]: itemIds,
        },
      },
    });

    console.log(dib);

    return Object.assign(
      itemInfo.dataValues,
      { arrOption: arrOption },
      { reviews: reviews },
      { relationItems: relationItems },
      { dib: dib },
    );
  }

  async getContacts(token): Promise<object> {
    const user = await helper.helpGetUser(token);

    // lineitems에서 구매처리가 된 것들만 반환해줘야 한다
    const lineItems = await LineItem.findAll({
      where: {
        userId: user.id,
        orderId: {
          [Op.ne]: null,
        },
      },
      // include option을 줘서 item id 도 함께 가져오자
      // LineItem id 와 Item id 충돌, 때문에 as 써줘야 됨
    });

    return lineItems;
  }

  async getListOrders(token): Promise<object> {
    // orders와 lineitems 둘 모두에게서 데이터를 가져와야 함
    // jwt.verify(token, 'salt', async function(err, decoded) {
    //   console.log(decoded);
    const orderList = await Order.findAll({
      where: {
        userId: 2,
      },
    });
    return { orderList: orderList };
    // })
  }

  async getItemList(): Promise<object> {
    const itemList = await Item.findAll();

    // 아이탬에서 가져올 때, img에 JSON화된 File Object가 존재한다. 이것을 처리한 뒤 보내줘야 client에서 유저가 생성한 아이탬 이미지가 잘 보여진다.
    // let result = itemList.map(item => {
    //   const parseItemImg = JSON.parse(item.img)
    //   if (typeof parseItemImg === 'object') {
    //     const urlItemImg = URL.createObjectURL(parseItemImg);
    //     item.img = urlItemImg;
    //     return item
    //   }
    // })

    return {
      itemList: itemList,
    };
  }

  async addDib(token, body): Promise<string> {
    // body = itemId
    const user = await helper.helpGetUser(token);

    const check = await Dib.findOne({
      where: {
        userId: user.id,
        itemId: body.id,
      },
    });

    if (check) {
      await Dib.destroy({
        where: {
          userId: user.id,
          itemId: body.id,
        },
      });
    } else {
      await Dib.findOrCreate({
        where: {
          userId: user.id,
          itemId: body.id,
        },
      });
    }

    return 'created';
  }

  async getDibList(token): Promise<object> {
    const user = await helper.helpGetUser(token);

    const dibList = await Dib.findAll({
      where: {
        userId: user.id,
      },
      include: [
        {
          model: Item,
        },
      ],
    });
    if (dibList) {
      return dibList;
    }
  }

  async getUserInfo(token): Promise<object> {
    try {
      const user = await helper.helpGetUser(token);

      const userInfo = await User.findOne({
        where: {
          id: user.id,
        },
      });

      // delete userInfo.dataValues.password;
      // buy Count에 따른 티어 이미지와 남은 구매 횟수도 알려줘야 됨
      let tierInfo = { tierImg: '', tierNum: 0 };
      if (userInfo.dataValues.buyCount > 100) {
        tierInfo.tierImg =
          'https://img.fmnation.net/files/attach/images/3423/628/779/063/e48662f28115ee80b2e27a4ab16d2241.png';
        tierInfo.tierNum = 99999;
        await User.update(
          {
            tier: 'Challenger',
          },
          {
            where: {
              id: user.id,
            },
          },
        );
      } else if (userInfo.dataValues.buyCount >= 40) {
        tierInfo.tierImg =
          'https://img.fmnation.net/files/attach/images/3423/628/779/063/4377f47c6e65242762f685f87c6420a2.png';
        tierInfo.tierNum = 100 - userInfo.dataValues.buyCount;
        await User.update(
          {
            tier: 'GrandMaster',
          },
          {
            where: {
              id: user.id,
            },
          },
        );
      } else if (userInfo.dataValues.buyCount >= 20) {
        tierInfo.tierImg =
          'https://img.fmnation.net/files/attach/images/3423/628/779/063/1144f3345a6513055bcd854c6df0f20d.png';
        tierInfo.tierNum = 40 - userInfo.dataValues.buyCount;
        await User.update(
          {
            tier: 'Master',
          },
          {
            where: {
              id: user.id,
            },
          },
        );
      } else if (userInfo.dataValues.buyCount >= 15) {
        tierInfo.tierImg =
          'https://img.fmnation.net/files/attach/images/3423/628/779/063/f960127ec20a0948a4871c72aeeb0cd3.png';
        tierInfo.tierNum = 20 - userInfo.dataValues.buyCount;
        await User.update(
          {
            tier: 'Diamond',
          },
          {
            where: {
              id: user.id,
            },
          },
        );
      } else if (userInfo.dataValues.buyCount >= 10) {
        tierInfo.tierImg =
          'https://img.fmnation.net/files/attach/images/3423/628/779/063/ff8b61da354a9fe0728b908158775560.png';
        tierInfo.tierNum = 15 - userInfo.dataValues.buyCount;
        await User.update(
          {
            tier: 'Platinum',
          },
          {
            where: {
              id: user.id,
            },
          },
        );
      } else if (userInfo.dataValues.buyCount >= 6) {
        tierInfo.tierImg =
          'https://img.fmnation.net/files/attach/images/3423/628/779/063/0c853789bc35fbc277b433016f5cfaf5.png';
        tierInfo.tierNum = 10 - userInfo.dataValues.buyCount;
        await User.update(
          {
            tier: 'Gold',
          },
          {
            where: {
              id: user.id,
            },
          },
        );
      } else if (userInfo.dataValues.buyCount >= 3) {
        tierInfo.tierImg =
          'https://img.fmnation.net/files/attach/images/3423/628/779/063/ca18528cb69f37582a8d2074d6cdc11a.png';
        tierInfo.tierNum = 6 - userInfo.dataValues.buyCount;
        await User.update(
          {
            tier: 'Silver',
          },
          {
            where: {
              id: user.id,
            },
          },
        );
      } else if (userInfo.dataValues.buyCount >= 1) {
        tierInfo.tierImg =
          'https://img.fmnation.net/files/attach/images/3423/628/779/063/8f0185e298221bbe87fa5777d646294f.png';
        tierInfo.tierNum = 3 - userInfo.dataValues.buyCount;
        await User.update(
          {
            tier: 'Bronze',
          },
          {
            where: {
              id: user.id,
            },
          },
        );
      } else {
        tierInfo.tierImg =
          'https://img.fmnation.net/files/attach/images/3423/628/779/063/3c62c3572310e427e1c2aefbaa41becb.png';
        tierInfo.tierNum = 1 - userInfo.dataValues.buyCount;
      }

      const result = Object.assign({}, userInfo.dataValues, tierInfo);

      return result;
    } catch (err) {
      return { message: 'err getUserInfo' };
    }
  }

  async deleteLineItem(token, body): Promise<void> {
    // lineitem db에서 body에 앎맞는 data를 지운 뒤, 유저의 lineitem 반환
    // data를 찾을 때는 orderId를 이용, orderId는 사용자가 장바구니에 아이탬을 담았을 때 해당 아이탬이 가리키는 basket을 의미함
    // LineItem 지우기는 회원만 가능
    const user = await helper.helpGetUser(token);

    await LineItem.destroy({
      where: {
        userId: user.id,
        name: body.name,
      },
    });
  }

  async addReview(token, body): Promise<void> {
    // body.contacts의 length 만큼 반복
    const user = await helper.helpGetUser(token);

    await body.contacts.forEach(async (contact) => {
      await Review.findOrCreate({
        where: {
          userId: user.id,
          itemId: contact.itemId,
          rate: body.rate, // 0.2 ~ 1.0 현재 rate column이 정수로만 저장되고 있음 문제가 뭘까??
          text: body.text,
          name: contact.name,
          buyOption: contact.buyOption,
          buyCount: contact.buyCount,
        },
      });
      // 리뷰의 별점을 아이탬에 적용해줘야 함
      const reviewsForRate = await Review.findAll({
        where: {
          itemId: contact.itemId,
        },
      });
      // 합
      console.log(reviewsForRate.length);
      const sumRate = reviewsForRate.reduce((x, y) => {
        console.log(y);
        console.log(y.dataValues.rate);
        // y.dataValues.rate = 0.2, 0.4, 0.6, 0.8, 1

        return x + y.dataValues.rate;
      }, 0);
      console.log(sumRate);
      const result = sumRate / reviewsForRate.length;
      console.log(result);
      await Item.update(
        {
          rate: (result * 10) / 2,
        },
        {
          where: {
            id: contact.itemId,
          },
        },
      );
    });
  }

  async getTag(): Promise<object> {
    const tagList = await Tag.findAll();
    return tagList;
  }

  async getAllTag() {
    const allTag = await statisticTag.findAll();
    return allTag;
  }

  async createItem(token, body) {
    console.log('~~~~~~~~~~~~~~~~~~~~~~');
    console.log(body);
    const user = await helper.helpGetUser(token);

    if (user.id === 2) {
      const result = await Item.findOrCreate({
        where: {
          name: body.name,
          price: body.price * 1,
        },
      });

      return result;
    }
  }

  async getStatistics(token): Promise<object> {
    const user = await helper.helpGetUser(token);
    // 관리자 통계 페이지에서 뿌려줄 통계들을 가공해 뿌려줘야 합니다
    // 1. 총수익: orders에 있는 total을 모두 더해준다.
    const statisticTotal = await Order.sum('total');

    // 2. 최고평점: items에 있는 item rate가 가장 높은 item
    const statisticRate = await Item.max('rate');

    // 3. 최다판매: items에 있는 item count가 가장 높은 item
    const statisticSale = await Item.max('count');

    // 4. 태그별 판매횟수:
    const statisticTagSale = await statisticTag.findAll({
      attributes: [
        ['tag', 'label'],
        ['count', 'value'],
      ],
    });

    // 5. 소비자 티어분포도
    // let tierArr = new Array(9).fill(1);
    let tierArr = [
      {
        label: 'Iron',
        value: 1,
      },
      {
        label: 'Bronze',
        value: 1,
      },
      {
        label: 'Silver',
        value: 1,
      },
      {
        label: 'Gold',
        value: 1,
      },
      {
        label: 'Platinum',
        value: 1,
      },
      {
        label: 'Diamond',
        value: 1,
      },
      {
        label: 'Master',
        value: 1,
      },
      {
        label: 'GrandMaster',
        value: 1,
      },
      {
        label: 'Challenger',
        value: 1,
      },
    ];
    const statisticTier = await User.findAll();

    statisticTier.forEach((el) => {
      const userTier = el.dataValues.tier;
      console.log(userTier);
      if (userTier === 'Iron') {
        tierArr[0].value = tierArr[0].value + 1;
      } else if (userTier === 'Bronze') {
        tierArr[1].value = tierArr[1].value + 1;
      } else if (userTier === 'Silver') {
        tierArr[2].value = tierArr[2].value + 1;
      } else if (userTier === 'Gold') {
        tierArr[3].value = tierArr[3].value + 1;
      } else if (userTier === 'Platinum') {
        tierArr[4].value = tierArr[4].value + 1;
      } else if (userTier === 'Diamond') {
        tierArr[5].value = tierArr[5].value + 1;
      } else if (userTier === 'Master') {
        tierArr[6].value = tierArr[6].value + 1;
      } else if (userTier === 'GrandMaster') {
        tierArr[7].value = tierArr[7].value + 1;
      } else if (userTier === 'Challenger') {
        tierArr[8].value = tierArr[8].value + 1;
      }
    });

    return {
      statisticTotal,
      statisticRate,
      statisticSale,
      statisticTagSale,
      tierArr,
    };
  }

  async addSearch(token, body): Promise<object> {
    // count column이 존재할 때,
    // 장점: 같은 유저가 같은 검색어를 검색할 때, 불필요한 데이터 개수를 늘리지 않을 수 있다
    // 단점: 코드 길이가 늘어난다??
    const user = await helper.helpGetUser(token);

    const checked = await Search.findOne({
      where: {
        userId: user.id,
        keyword: body.keyword,
      },
    });

    if (!checked) {
      const createKeyword = await Search.create({
        userId: user.id,
        keyword: body.keyword,
      });

      return createKeyword;
    } else {
      const addCountKeyword = await Search.increment(
        {
          count: +1,
        },
        {
          where: {
            userId: user.id,
            keyword: body.keyword,
          },
        },
      );

      return addCountKeyword;
    }
  }

  async getKeywordRate(): Promise<object> {
    const keywordRate = await Search.findAll({
      order: [['count', 'DESC']],
    });
    // 다 가져와서 정렬한 후 리턴 or 정렬한 것을 가져와서 리턴
    return keywordRate;
  }

  async addFilterTag(token, body): Promise<string> {
    // 데이터 양이 많아지면 해당 테이블 구조는 문제가 생길 수??
    const user = await helper.helpGetUser(token);

    const checked = await FilterTag.findOne({
      where: {
        userId: user.id,
        tag: body.tag,
      },
    });

    if (!checked) {
      await FilterTag.create({
        userId: user.id,
        tag: body.tag,
      });
      return 'create';
    } else {
      await FilterTag.destroy({
        where: {
          userId: user.id,
          tag: body.tag,
        },
      });
      return 'delete';
    }
  }

  async getFilterTag(token): Promise<object> {
    const user = await helper.helpGetUser(token);

    const filters = await FilterTag.findAll({
      where: {
        userId: user.id,
      },
      attributes: ['tag'],
    });

    // ['스킨', '챔피언']의 형태로
    return filters;
  }

  async addBell(token, body): Promise<object> {
    const user = await helper.helpGetUser(token);

    const createBell = await Bell.create({
      userId: user.id,
      text: body.text,
    });
    return createBell;
  }

  async getBell(token): Promise<object> {
    try {
      const user = await helper.helpGetUser(token);

      const bellList = await Bell.findAll({
        where: {
          userId: user.id,
          // read: {
          //   [Op.ne]: true
          // }
        },
      });

      return bellList;
    } catch (err) {
      // invalid token 일 때 에러 핸들링
      return { message: 'err getBell' };
    }
  }

  async clearBellBedge(token): Promise<string> {
    const user = await helper.helpGetUser(token);

    await Bell.update(
      {
        read: true,
      },
      {
        where: {
          userId: user.id,
        },
      },
    );
    return 'done clear bell';
  }

  async addOption(token, body): Promise<string> {
    const user = await helper.helpGetUser(token);

    // 가장 최근 추가된 아이탬에 추가하는 로직..
    // api 호출은 아이탬이 생성되었을 때만 되어야 함!
    // body는 arr
    const items = await Item.findAll();

    console.log(body);
    console.log(items.length);
    body.option.forEach(async (opt) => {
      await Option.create({
        itemId: items.length,
        option: opt.option,
        optionPrice: opt.price,
      });
    });
    // await Option.create({
    //   itemId: items.length - 1,
    // })

    return 'done update option';
  }

  async addTag(token, body): Promise<void> {
    const user = await helper.helpGetUser(token);

    const items = await Item.findAll();

    body.tag.forEach(async (tag) => {
      await Tag.findOrCreate({
        where: {
          itemId: items.length,
          tag: tag,
        },
      });
    });
  }

  async getRp(token, body): Promise<string> {
    // rp 충전에 대한 요청과 결제수단에 대한 요청을 받아서 결제 및 충전 과정을 해결한다.
    const user = await helper.helpGetUser(token);

    // 결제 코드
    // 충전 코드
    console.log(body);
    await User.increment(
      {
        rp: +body.selectRp,
      },
      {
        where: {
          id: user.id,
        },
      },
    );

    return 'done rp';
  }

  async addOrderNow(token, body): Promise<string> {
    const user = await helper.helpGetUser(token);

    console.log(body);
    const userRp = await User.findOne({
      where: {
        id: user.id,
      },
      attributes: ['rp'],
    });

    if (userRp.dataValues.rp < body.total) {
      console.log('!!!!!!!!!!!!!!!!!!!!');
      return '잔액이 부족합니다';
    } else {
      // rp 차감
      await User.increment(
        {
          rp: -body.total,
        },
        {
          where: {
            id: user.id,
          },
        },
      );

      const orderInfo = await Order.create({
        userId: user.id,
        total: body.total,
      });

      await LineItem.create({
        name: body.name,
        img: body.img,
        itemId: body.itemId,
        lineTotal: body.lineTotal,
        userId: user.id,
        buyOption: body.buyOption,
        buyCount: body.buyCount,
      });

      await LineItem.update(
        {
          // 생성된 오더 아이디가 들어가야 됨
          orderId: orderInfo.dataValues.id,
        },
        {
          where: {
            userId: user.id,
            orderId: null,
          },
        },
      );

      await Item.increment(
        {
          count: +1,
        },
        {
          where: {
            id: body.itemId,
          },
        },
      );
      // statisticTag table에 해당 아이탬의 태그가 들어가야함
      // 태그 어떻게 가져올 것인가??
      // 방금 생성한 오더 아이디를 통해서 유저가 구매한 아이탬리스트를 가져올 수 있음

      const buyItems = await LineItem.findAll({
        where: {
          orderId: orderInfo.dataValues.id,
        },
        include: {
          model: Item,
          attributes: ['id'],
        },
      });

      console.log(buyItems);

      // 해당 아이템 리스트와 include 옵션으로 쿼리를 보내서 tag를 구한다음 해당 statisticTag에 추가
      // buyItems 개수만큼 반복

      // buyItems.forEach(async (buyItem) => {
      //   // 아이탬 아이디를 바탕으로 tag table에 요청을 보내서 tag들을 받아오고 그걸 바탕으로 또 statisticTag table 넣어줘야한다.
      //   const itemId = buyItem.dataValues.Item.id

      //   const tags = await Tag.findAll({
      //     where: {
      //       itemId: itemId,
      //     }
      //   })

      //   tags.forEach(async (tag) => {
      //     const tagName = tag.dataValues.tag;

      //     await statisticTag.increment(
      //       {
      //         count: + 1,
      //       },
      //       {
      //       where: {
      //         tag: tagName
      //       }
      //     })
      //   })
      // });

      console.log(4);
      await User.increment(
        {
          buyCount: +1,
        },
        {
          where: {
            id: user.id,
          },
        },
      );
    }
    return 'done buy one';
  }

  async success(token, body): Promise<string> {
    const user = await helper.helpGetUser(token);
    const secretKey = 'test_sk_5GePWvyJnrKbdKNP1ZeVgLzN97Eo:';
    if (body.query[0] && body.query[1] && body.query) {
      const orderId = body.query[0].split('=')[1];
      const paymentKey = body.query[1].split('=')[1];
      const amount = body.query[2].split('=')[1];
      if (true) {
        const { data } = await axios.post(
          `https://api.tosspayments.com/v1/payments/${paymentKey}`,
          {
            orderId: orderId,
            amount: amount,
          },
          {
            headers: {
              Authorization:
                `Basic ` + Buffer.from(secretKey + ':').toString('base64'),
              'Content-type': 'application/json',
            },
          },
        );
        console.log(data);
        if (data.status === 'DONE') {
          let targetRp;
          if (amount === '4900') {
            targetRp = 580;
          } else if (amount === '9900') {
            targetRp = 1320;
          } else if (amount === '19900') {
            targetRp = 2700;
          } else if (amount === '35000') {
            targetRp = 4350;
          } else if (amount === '49900') {
            targetRp = 6275;
          } else if (amount === '99900') {
            targetRp = 13000;
          }

          await User.increment(
            {
              rp: +targetRp,
            },
            {
              where: {
                id: user.id,
              },
            },
          );
          console.log('성공');
          return '성공';
        } else {
          console.log('실패');
          return '실패';
        }
      } else {
        console.log('실패');
        return '실패';
      }
    }
  }

  async getLineItemForBasket(token): Promise<object> {
    const user = await helper.helpGetUser(token);

    const LineItemForBasket = await LineItem.findAll({
      where: {
        userId: user.id,
        orderId: null,
      },
    });

    return LineItemForBasket;
  }

  async configName(token, body): Promise<object> {
    const user = await helper.helpGetUser(token);

    const newName = await User.update(
      {
        name: body.newName,
      },
      {
        where: {
          id: user.id,
        },
      },
    );
    return newName;
  }

  async configPw(token, body): Promise<string> {
    const user = await helper.helpGetUser(token);

    // body.password, body.newPassword

    // 현재 패스워드가 올바른지 검사
    const userData = await User.findOne({
      where: {
        id: user.id,
      },
    });

    const isVerify = await passwordHash.verify(
      body.password,
      userData.dataValues.password,
    );

    if (!isVerify) {
      throw new Error('잘못된 비밀번호');
    } else {
      // 맞다면 비밀번호를 업데이트 해줘야 함

      const newPassword = passwordHash.generate(body.newPassword);

      await User.update(
        {
          password: newPassword,
        },
        {
          where: {
            id: user.id,
          },
        },
      );

      return '비밀번호 변경 성공';
    }
  }

  async deleteUser(token, body): Promise<string> {
    const user = await helper.helpGetUser(token);

    // password 검증
    const userData = await User.findOne({
      where: {
        id: user.id,
      },
    });

    const isVerify = await passwordHash.verify(
      body.password,
      userData.dataValues.password,
    );
    // User 정보 삭제 후 어떤 데이터가 삭제되는지 판단 후 수정
    if (isVerify) {
      await User.destroy({
        where: {
          id: user.id,
        },
      });
      return '탈퇴 성공';
    } else {
      return '탈퇴 실패';
    }
  }

  async deleteItem(token, body): Promise<string> {
    const user = await helper.helpGetUser(token);

    // body 정보와 일치하는 아이탬을 삭제해야됨
    // if (decoded.id === 2) {
    await Item.destroy({
      where: {
        id: body.id,
      },
    });
    return '삭제 성공';
    // } else {
    // return '삭제 실패';
    // }
  }

  async deleteBells(token): Promise<string> {
    const user = await helper.helpGetUser(token);

    await Bell.destroy({
      where: {
        id: user.id,
      },
    });

    return 'ok';
  }
}
