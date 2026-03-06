export interface EventInfo {
    id: string,
    name: String
}

export const wca_events: EventInfo[] = [
    {id:'333', name:'3x3x3 Cube'},
    {id:'222', name:'2x2x2 Cube'},
    {id:'444', name:'4x4x4 Cube'},
    {id:'555', name:'5x5x5 Cube'},
    {id:'666', name:'6x6x6 Cube'},
    {id:'777', name:'7x7x7 Cube'},
    {id:'333fm', name:'3x3x3 Fewest Moves'},
    {id:'333mbf', name:'3x3x3 Multi-Blind'},
    {id:'333oh', name:'3x3x3 One-Handed'},
    {id:'333bf', name:'3x3x3 Blindfolded'},
    {id:'444bf', name:'4x4x4 Blindfolded'},
    {id:'555bf', name:'5x5x5 Blindfolded'},
    {id:'clock', name:'Clock'},
    {id:'minx', name:'Megaminx'},
    {id:'pyram', name:'Pyraminx'},
    {id:'skewb', name:'Skewb'},
    {id:'sq1', name:'Square-1'},
]

export const getNameFromId = function(id: string) {
    let eventList = wca_events.filter((event) => event.id == id)
    if (eventList.length==0) return ''
    return eventList[0].name;
}