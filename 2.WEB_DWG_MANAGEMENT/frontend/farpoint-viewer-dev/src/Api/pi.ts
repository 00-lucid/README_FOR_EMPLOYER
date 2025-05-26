import crypt from '../Lib/crypt';
import api from './init';

export function getAllDetail(docNo: string, docVr: string): Promise<Mimic[]> {
    return api
        .get(`/pi/detail?docNo=${crypt.encrypt(docNo)}&docVr=${crypt.encrypt(docVr)}`)
        .then(({ data }) => {
            return data
        })
        .catch((err) => {
            console.log(err)
            return 
        })
}