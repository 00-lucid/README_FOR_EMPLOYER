import axios from 'axios';
import { Button, f7ready, Page, Navbar, Swiper, SwiperSlide, Toolbar, Block, NavTitle, List, ListItem } from 'framework7-react';
import React, { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { Pagination } from 'swiper';
import { getToken } from '../common/auth';
import sanitizeHtml from '../js/utils/sanitizeHtml';
import { allTagState, filterTagState, tagState } from '../recoil/state';

const ConfigTagPage = (props) => {

    const tags = useRecoilValue(allTagState);

    const requestFilterTag = (tag) => {
        console.log(tag);
        axios.post('https://localhost:3000/add-filter-tag', {
            tag: tag,
        }, { headers: { authorization: `Bearer ${getToken().token}` } })
        .then(res => {
            console.log(res.data);
        })
    }
    
    const filterTag = useRecoilValue(filterTagState);

    useEffect(() => {
    }, [filterTag])

    return (
    <Page style={{
        color: "#F3EAD7",
    }}>
        <Navbar title="관심 태그 설정" backLink />
        <Block className="flex flex-col justify-center items-center m-8">
            <p className="text-lg" >홈 화면에서 보고 싶지 않은 태그는</p>
            <p className="text-lg">체크를 해제하세요</p>
            <p className="text-gray-500">최소 1개 이상 선택되어 있어야 합니다.</p>
        </Block>
        <Block>
            <List>
                {
                    tags.map(tag => {
                        return <ListItem checkbox title={tag.tag} defaultChecked onClick={() => requestFilterTag(tag.tag)} style={{ backgroundColor: '#02111b'}}></ListItem>
                    })
                }
            </List>
        </Block>
    </Page>
    )
}
export default ConfigTagPage