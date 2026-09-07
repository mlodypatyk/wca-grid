import { getNameFromId } from '../eventNames'

export const getReadableCategoryName = function (category: string) {
  const catType = category.split(':')[0];
  const catData = category.split(':')[1];
  if (catType == 'result'){
    const event = catData.split(' ')[1];
    const requirement = catData.split(' ')[2].substring(4)
    return `${getNameFromId(event)} under ${parseFloat(requirement).toString()}${event == '333fm' ? ' moves' : 's'}`
  }
  if (catType == 'country') {
    return `Represented ${catData}`
  }
  if (catType == 'cont_podium'){
    return `Continental championship podium: ${catData.substring(2)}`
  }
  if (catType == 'worlds_podium'){
    return `World championship podium`
  }
  if (catType == 'comps'){
    return `${catData.substring(1)} competitions`
  }
  return category
}
