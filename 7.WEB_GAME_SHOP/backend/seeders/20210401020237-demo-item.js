'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    return await queryInterface.bulkInsert(
      'items',
      [
        {
          name: '2021 우주 그루브 메가 세트',
          rate: 0,
          review: 91,
          price: 19570,
          status: 'sale',
          sale: '30',
          count: 11,
          img:
            'https://d392eissrffsyf.cloudfront.net/storeImages/bundles/99901061.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: '우주 그루브 나서스 테두리 세트',
          rate: 4.8,
          review: 3102,
          price: 3125,
          status: 'on',
          count: 7,
          img:
            'https://d392eissrffsyf.cloudfront.net/storeImages/bundles/99901056.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: '우주 그루브 럭스 테두리 세트',
          rate: 3.9,
          review: 7,
          price: 3330,
          status: 'on',
          count: 1,
          img:
            'https://d392eissrffsyf.cloudfront.net/storeImages/bundles/99901054.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: '우주 그루브 사미라 테두리 세트',
          rate: 4.9,
          review: 1500,
          price: 3515,
          status: 'on',
          count: 9100,
          img:
            'https://d392eissrffsyf.cloudfront.net/storeImages/bundles/99901060.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: '우주 그루브 블리츠와 크랭크 테두리 세트',
          rate: 4.8,
          review: 90000,
          price: 3800,
          status: 'on',
          count: 200000,
          img:
            'https://d392eissrffsyf.cloudfront.net/storeImages/bundles/99901058.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'K/DA ALL OUT 이블린',
          rate: 4.9,
          review: 110000,
          price: 1350,
          status: 'sale',
          sale: '10',
          count: 400000,
          img:
            'https://cdn-store.leagueoflegends.co.kr/images/v2/champion-splashes/28015.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        {
          name: '우주 그루브 나서스',
          rate: 4.9,
          review: 5000,
          price: 1350,
          status: 'on',
          count: 400000,
          img:
            'https://cdn-store.leagueoflegends.co.kr/images/v2/champion-splashes/75025.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: '우주 그루브 누누와 윌럼프',
          rate: 4.9,
          review: 5000,
          price: 1350,
          status: 'sale',
          sale: '50',
          count: 400000,
          img:
            'https://cdn-store.leagueoflegends.co.kr/images/v2/champion-splashes/20016.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: '우주 그루브 럼블',
          rate: 4.9,
          review: 5000,
          price: 1350,
          status: 'on',
          count: 400000,
          img:
            'https://cdn-store.leagueoflegends.co.kr/images/v2/champion-splashes/68013.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: '우주 그루브 룰루',
          rate: 4.9,
          review: 5000,
          price: 1350,
          status: 'on',
          count: 400000,
          img:
            'https://cdn-store.leagueoflegends.co.kr/images/v2/champion-splashes/117026.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: '우주 그루브 블리츠와 크랭크',
          rate: 4.9,
          review: 5000,
          price: 1820,

          status: 'sale',
          sale: '10',
          count: 400000,
          img:
            'https://cdn-store.leagueoflegends.co.kr/images/v2/champion-splashes/53029.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: '전투사관학교 가렌',
          rate: 4.9,
          review: 5000,
          price: 1350,
          status: 'sale',
          sale: '10',
          count: 400000,
          img:
            'https://cdn-store.leagueoflegends.co.kr/images/v2/champion-splashes/86024.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: '전투사관학교 레오나',
          rate: 4.9,
          review: 5000,
          price: 1350,
          status: 'on',
          count: 400000,
          img:
            'https://cdn-store.leagueoflegends.co.kr/images/v2/champion-splashes/89021.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        {
          name: '어둠서리 벨코즈',
          rate: 4.9,
          review: 5000,
          price: 1350,
          status: 'on',
          count: 400000,
          img:
            'https://cdn-store.leagueoflegends.co.kr/images/v2/champion-splashes/161011.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        {
          name: '어둠서리 사이온',
          rate: 4.9,
          review: 5000,
          price: 1350,
          status: 'on',
          count: 400000,
          img:
            'https://cdn-store.leagueoflegends.co.kr/images/v2/champion-splashes/14022.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        {
          name: '용 수호자 갈리오',
          rate: 4.9,
          review: 5000,
          price: 1350,
          status: 'on',
          count: 400000,
          img:
            'https://cdn-store.leagueoflegends.co.kr/images/v2/champion-splashes/3019.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        {
          name: '전투사관학교 요네',
          rate: 4.9,
          review: 5000,
          price: 1820,

          status: 'on',
          count: 400000,
          img:
            'https://cdn-store.leagueoflegends.co.kr/images/v2/champion-splashes/777010.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        {
          name: '전투사관학교 케이틀린',
          rate: 4.9,
          review: 5000,
          price: 1350,
          status: 'on',
          count: 400000,
          img:
            'https://cdn-store.leagueoflegends.co.kr/images/v2/champion-splashes/51022.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        {
          name: '꿀잼 말자하',
          rate: 4.9,
          review: 5000,
          price: 1350,
          status: 'on',
          count: 400000,
          img:
            'https://cdn-store.leagueoflegends.co.kr/images/v2/champion-splashes/90018.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: '꿀잼 유미',
          rate: 4.9,
          review: 5000,
          price: 1350,
          status: 'on',
          count: 400000,
          img:
            'https://cdn-store.leagueoflegends.co.kr/images/v2/champion-splashes/350019.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: '꿀잼 코그모',
          rate: 4.9,
          review: 5000,
          price: 1820,

          status: 'on',
          count: 400000,
          img:
            'https://cdn-store.leagueoflegends.co.kr/images/v2/champion-splashes/96028.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: '메마른 장미 탈론',
          rate: 4.9,
          review: 5000,
          price: 1350,
          status: 'on',
          count: 400000,
          img:
            'https://cdn-store.leagueoflegends.co.kr/images/v2/champion-splashes/91029.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: '수정 장미 자이라',
          rate: 4.9,
          review: 5000,
          price: 1350,
          status: 'on',
          count: 400000,
          img:
            'https://cdn-store.leagueoflegends.co.kr/images/v2/champion-splashes/143007.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: '새해 야수 아펠리오스',
          rate: 4.9,
          review: 5000,
          price: 1350,
          status: 'on',
          count: 400000,
          img:
            'https://cdn-store.leagueoflegends.co.kr/images/v2/champion-splashes/523009.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: '전설의 산수화 노틸러스',
          rate: 4.9,
          review: 5000,
          price: 1350,
          status: 'on',
          count: 400000,
          img:
            'https://cdn-store.leagueoflegends.co.kr/images/v2/champion-splashes/111009.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: '몰락한 쉬바나',
          rate: 4.9,
          review: 5000,
          price: 1350,
          status: 'on',
          count: 400000,
          img:
            'https://cdn-store.leagueoflegends.co.kr/images/v2/champion-splashes/102008.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: '몰락한 카르마',
          rate: 4.9,
          review: 5000,
          price: 1350,
          status: 'on',
          count: 400000,
          img:
            'https://cdn-store.leagueoflegends.co.kr/images/v2/champion-splashes/43027.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: '습격자 칼리스타',
          rate: 4.9,
          review: 5000,
          price: 1350,
          status: 'on',
          count: 400000,
          img:
            'https://cdn-store.leagueoflegends.co.kr/images/v2/champion-splashes/429005.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: '심판자 그라가스',
          rate: 4.9,
          review: 5000,
          price: 1350,
          status: 'sale',
          sale: '50',
          count: 400000,
          img:
            'https://cdn-store.leagueoflegends.co.kr/images/v2/champion-splashes/79011.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        {
          name: '심판자 퀸',
          rate: 4.9,
          review: 5000,
          price: 1350,
          status: 'sale',
          sale: '50',
          count: 400000,
          img:
            'https://cdn-store.leagueoflegends.co.kr/images/v2/champion-splashes/133005.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        {
          name: '나무정령 아지르',
          rate: 4.9,
          review: 5000,
          price: 1350,
          status: 'sale',
          sale: '30',
          count: 400000,
          img:
            'https://cdn-store.leagueoflegends.co.kr/images/v2/champion-splashes/268005.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        {
          name: '나무정령 오른',
          rate: 4.9,
          review: 5000,
          price: 1350,
          status: 'sale',
          sale: '30',
          count: 400000,
          img:
            'https://cdn-store.leagueoflegends.co.kr/images/v2/champion-splashes/516002.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        {
          name: '나무정령 자야',
          rate: 4.9,
          review: 5000,
          price: 1820,

          status: 'on',
          count: 400000,
          img:
            'https://cdn-store.leagueoflegends.co.kr/images/v2/champion-splashes/498008.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        {
          name: '전투 여왕 다이애나',
          rate: 4.9,
          review: 5000,
          price: 1350,
          status: 'on',
          count: 400000,
          img:
            'https://cdn-store.leagueoflegends.co.kr/images/v2/champion-splashes/131025.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        {
          name: '전투 여왕 카타리나',
          rate: 4.9,
          review: 5000,
          price: 1820,
          status: 'on',
          count: 400000,
          img:
            'https://cdn-store.leagueoflegends.co.kr/images/v2/champion-splashes/55029.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        {
          name: '우주 돌격대 헤카림',
          rate: 4.9,
          review: 5000,
          price: 1350,
          status: 'on',
          count: 400000,
          img:
            'https://cdn-store.leagueoflegends.co.kr/images/v2/champion-splashes/120014.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        {
          name: '정령용 애쉬',
          rate: 4.9,
          review: 5000,
          price: 1350,
          status: 'on',
          count: 400000,
          img:
            'https://cdn-store.leagueoflegends.co.kr/images/v2/champion-splashes/22023.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        {
          name: '유미',
          rate: 5.0,
          review: 5000,
          price: 975,
          status: 'on',
          count: 400000,
          img:
            'https://cdn-store.leagueoflegends.co.kr/images/v2/champion-splashes/350000.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: '비에고',
          rate: 5.0,
          review: 5000,
          price: 975,
          status: 'on',
          count: 400000,
          img:
            'https://cdn-store.leagueoflegends.co.kr/images/v2/champion-splashes/234000.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: '렐',
          rate: 5.0,
          review: 5000,
          price: 975,
          status: 'on',
          count: 400000,
          img:
            'https://cdn-store.leagueoflegends.co.kr/images/v2/champion-splashes/526000.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: '세라핀',
          rate: 5.0,
          review: 5000,
          price: 975,
          status: 'on',
          count: 400000,
          img:
            'https://cdn-store.leagueoflegends.co.kr/images/v2/champion-splashes/147000.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: '사미라',
          rate: 5.0,
          review: 5000,
          price: 975,
          status: 'on',
          count: 400000,
          img:
            'https://cdn-store.leagueoflegends.co.kr/images/v2/champion-splashes/360000.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: '요네',
          rate: 5.0,
          review: 5000,
          price: 975,
          status: 'on',
          count: 400000,
          img:
            'https://cdn-store.leagueoflegends.co.kr/images/v2/champion-splashes/777000.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: '릴리아',
          rate: 5.0,
          review: 5000,
          price: 975,
          status: 'on',
          count: 400000,
          img:
            'https://cdn-store.leagueoflegends.co.kr/images/v2/champion-splashes/876000.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        {
          name: '그웬',
          rate: 5.0,
          review: 5000,
          price: 975,
          status: 'on',
          count: 400000,
          img:
            'https://cdn-store.leagueoflegends.co.kr/images/v2/champion-splashes/887000.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        {
          name: '카이사',
          rate: 5.0,
          review: 5000,
          price: 975,
          status: 'on',
          count: 400000,
          img:
            'https://cdn-store.leagueoflegends.co.kr/images/v2/champion-splashes/145000.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        {
          name: '조이',
          rate: 5.0,
          review: 5000,
          price: 975,
          status: 'on',
          count: 400000,
          img:
            'https://cdn-store.leagueoflegends.co.kr/images/v2/champion-splashes/142000.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        {
          name: '오른',
          rate: 5.0,
          review: 5000,
          price: 975,
          status: 'on',
          count: 400000,
          img:
            'https://cdn-store.leagueoflegends.co.kr/images/v2/champion-splashes/516000.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        {
          name: '케인',
          rate: 5.0,
          review: 5000,
          price: 975,
          status: 'on',
          count: 400000,
          img:
            'https://cdn-store.leagueoflegends.co.kr/images/v2/champion-splashes/141000.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        {
          name: '라칸',
          rate: 5.0,
          review: 5000,
          price: 975,
          status: 'on',
          count: 400000,
          img:
            'https://cdn-store.leagueoflegends.co.kr/images/v2/champion-splashes/497000.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        {
          name: '자야',
          rate: 5.0,
          review: 5000,
          price: 975,
          status: 'on',
          count: 400000,
          img:
            'https://cdn-store.leagueoflegends.co.kr/images/v2/champion-splashes/498000.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        {
          name: '카밀',
          rate: 5.0,
          review: 5000,
          price: 975,
          status: 'on',
          count: 400000,
          img:
            'https://cdn-store.leagueoflegends.co.kr/images/v2/champion-splashes/164000.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        {
          name: '클레드',
          rate: 5.0,
          review: 5000,
          price: 975,
          status: 'on',
          count: 400000,
          img:
            'https://cdn-store.leagueoflegends.co.kr/images/v2/champion-splashes/240000.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        {
          name: '탈리아',
          rate: 5.0,
          review: 5000,
          price: 975,
          status: 'on',
          count: 400000,
          img:
            'https://cdn-store.leagueoflegends.co.kr/images/v2/champion-splashes/163000.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        {
          name: '아우렐리온 솔',
          rate: 5.0,
          review: 5000,
          price: 975,
          status: 'on',
          count: 400000,
          img:
            'https://cdn-store.leagueoflegends.co.kr/images/v2/champion-splashes/136000.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        {
          name: '진',
          rate: 5.0,
          review: 5000,
          price: 975,
          status: 'on',
          count: 400000,
          img:
            'https://cdn-store.leagueoflegends.co.kr/images/v2/champion-splashes/202000.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        {
          name: '킨드레드',
          rate: 5.0,
          review: 5000,
          price: 975,
          status: 'on',
          count: 400000,
          img:
            'https://cdn-store.leagueoflegends.co.kr/images/v2/champion-splashes/203000.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        {
          name: '에코',
          rate: 5.0,
          review: 5000,
          price: 975,
          status: 'on',
          count: 400000,
          img:
            'https://cdn-store.leagueoflegends.co.kr/images/v2/champion-splashes/245000.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {},
    );
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    return await queryInterface.bulkInsert('items', null, {});
  },
};
