import { PIRepository } from './PIRepository'

export class PIService {
    public static create(repo: PIRepository): PIService {
        return new PIService(repo)
    }

    private readonly repo: PIRepository

    private constructor(repo: PIRepository) {
        this.repo = repo
    }

    /**
     * PI details 를 가져오고 올바른 미믹이 있는지 검사하는 함수
     */
    private async getVerifyDetails(
        dto: {
            plant: string
            piNo: string
            site: string
        },
        folId: string
    ): Promise<Mimic[]> {
        const details = await this.repo.findAllDetail(dto)

        if (details.length > 0) {
            if (folId.length === 18) {
                console.log('verify details: ', details)
                return details
            } else {
                return []
            }
        } else {
            return []
        }
    }

    public async getAllDetail(dto: { docNo: string; docVr: string }): Promise<Mimic[]> {
        let siteHo, pbsNo, sPiNo

        const keyOfDetail = (await this.repo.findKeyOfDetail(dto))[0]

        if (keyOfDetail) {
            const { FOLID, PLANTCODE, PBS_NO } = keyOfDetail
            const hogi = (await this.repo.findHogiGubun(FOLID))[0]
            if (undefined !== hogi) {
                const { HOGI_GUBUN } = hogi

                if (HOGI_GUBUN === 'L') siteHo = 'O'
                else siteHo = HOGI_GUBUN

                // PBS_NO가 falsy면 찾는다
                if (PBS_NO === '' || PBS_NO === null) {
                    switch (PLANTCODE) {
                        case '2310':
                            pbsNo = dto.docNo.substring(4, 2)
                            break
                        case '2120':
                            pbsNo = dto.docNo.substring(4, 2)
                            break
                        default:
                            pbsNo = dto.docNo.substring(2, 3)
                            break
                    }
                }

                // Detail을 찾는다
                switch (PLANTCODE) {
                    case '2110':
                        // #2
                        return this.getVerifyDetails(
                            {
                                plant: PLANTCODE,
                                piNo: pbsNo || PBS_NO,
                                site: siteHo
                            },
                            FOLID
                        )
                    case '2420':
                        // #3
                        return this.getVerifyDetails(
                            {
                                plant: PLANTCODE,
                                piNo: pbsNo || PBS_NO,
                                site: siteHo
                            },
                            FOLID
                        )
                    default:
                        const detailInfo = (
                            await this.repo.findAllDetailInfo({
                                plant: PLANTCODE,
                                pbsNo: pbsNo || PBS_NO
                            })
                        )[0]

                        if (undefined !== detailInfo) {
                            const { PI_NO, PBS_NO } = detailInfo

                            // PI_NO가 falsy면 찾는다
                            if (PI_NO === '' || PI_NO === null) {
                                try {
                                    let piCnt = '0'
                                    pbsNo = dto.docNo.substring(
                                        dto.docNo.indexOf('-') + 1,
                                        dto.docNo.substring(dto.docNo.indexOf('-') + 1).indexOf('-')
                                    )
                                    sPiNo = pbsNo

                                    piCnt = await this.repo.findCountOfDetail({
                                        plant: PLANTCODE,
                                        piNo: sPiNo,
                                        site: siteHo
                                    })

                                    if (piCnt == '0') {
                                        pbsNo = dto.docNo.substring(0, dto.docNo.indexOf('-'))
                                        sPiNo = pbsNo
                                    }
                                } catch (e) {
                                    console.log(e)
                                }

                                // #4
                                return this.getVerifyDetails(
                                    {
                                        plant: PLANTCODE,
                                        piNo: sPiNo || pbsNo || PBS_NO,
                                        site: siteHo
                                    },
                                    FOLID
                                )
                            } else {
                                // #1
                                return this.getVerifyDetails(
                                    {
                                        plant: PLANTCODE,
                                        piNo: sPiNo || PI_NO,
                                        site: siteHo
                                    },
                                    FOLID
                                )
                            }
                        }
                }
            }

            return []
        }

        return []
    }
}
