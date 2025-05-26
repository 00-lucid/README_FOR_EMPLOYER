type MimicPopupValue = {
    message: string
    nextAction: () => void
}

type Mimic = {
    FOLDER_ID: string
    PI_NM: string
    PI_URL: string
}

type MimicViewProps = {
    MimicList: Mimic[]
    selectedMimic: Set<string>
    setSelectedMimic: (set: Set<string>) => void
}