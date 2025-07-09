export default function parseDuration(time:string){
    const intTime = Number(time);
    return Math.floor(intTime/60);
}