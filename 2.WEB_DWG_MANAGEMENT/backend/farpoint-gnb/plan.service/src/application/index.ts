export * from './folders'
export * from './DocumentService'
export * from './DocumentRepository'

export * from './system'
export * from './SystemRepository'

export * from './mydocs'
export * from './MydocsService'
export * from './MydocsRepository'

export * from './PLDController'
export * from './PLDService'
export * from './PLDRepository'

export * from './PIController'
export * from './PIService'
export * from './PIRepository'

export * from './convert/ConvertController'
export * from './convert/ConvertService'
export * from './convert/ConvertRepository'

export function replaceDns(url: string): string {
    let result = url

    const dnsValue = process.env['DNS'] as string

    if (dnsValue) {
        const dnslist = JSON.parse(dnsValue) as {
            name: string
            ip: string
        }[]

        if (dnslist) {
            for (const dns of dnslist) {
                result = result.replace(dns.name, dns.ip)
            }
        }
    }

    return result
}
