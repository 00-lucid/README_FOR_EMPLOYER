type NotiOrder = {
    type: string // 'noti', 'order'
    id: string // qmnum/aufnr
    detail: string // qmtxt/ktext
    function: string // mapar
    equipmentExtId: string // equnr
    taskType: string // qmart,auart
    startDate: string // qmdate,gstrp
    endDate: string // qmdate,gltrp
    status: string // status
    tplnr: string
}

type EquipmentNotiOrder = {
    tagId: string
    function: string
    notifications: NotiOrder[]
    orders: NotiOrder[]
}