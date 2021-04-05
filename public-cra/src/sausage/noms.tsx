import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'
import Style from 'ol/style/Style'
import Text from 'ol/style/Text'
import { IMapPollingGeoJSONNoms, IMapPollingPlaceFeature } from '../redux/modules/polling_places'
import { stringDivider } from '../utils'

export class NomsReader {
  static coreNomsIcons = ['bbq', 'cake', 'nothing', 'run_out']

  static foodNomsIcons = ['bbq', 'cake', 'bacon_and_eggs', 'halal', 'vego', 'coffee']

  static additionalFoodNomsIcons = ['bacon_and_eggs', 'halal', 'vego', 'coffee']

  noms: IMapPollingGeoJSONNoms | null

  constructor(noms: IMapPollingGeoJSONNoms | null) {
    this.noms = this.filterFalsey(noms)
  }

  public hasAnyNoms() {
    return this.noms !== null
  }

  public hasRedCrossOfShame() {
    return this.isPropertyTrue('nothing')
  }

  public hasRunOut() {
    return this.isPropertyTrue('run_out')
  }

  public hasNomsOption(prop: string) {
    return this.isPropertyTrue(prop)
  }

  public hasExtraNoms() {
    return this.hasAnyPropertiesTrue(NomsReader.additionalFoodNomsIcons)
  }

  public getFoodIconNamesFromNoms() {
    if (this.noms === null) {
      return []
    }

    return Object.keys(this.noms).filter((nomsName: string) => NomsReader.foodNomsIcons.includes(nomsName))
  }

  public getIconForNoms(spriteIcons: any) {
    const hasMoreOptions = this.hasExtraNoms()

    if (this.isPropertyTrue('nothing') === true) {
      return spriteIcons.red_cross_of_shame
    }
    if (this.hasAllPropertiesTrue(['bbq', 'cake'])) {
      if (this.isPropertyTrue('run_out') === true) {
        return spriteIcons.bbq_and_cake_run_out
      }
      if (hasMoreOptions === true) {
        return spriteIcons.bbq_and_cake_plus
      }
      return spriteIcons.bbq_and_cake
    }
    if (this.isPropertyTrue('bbq') === true) {
      if (this.isPropertyTrue('run_out') === true) {
        return spriteIcons.bbq_run_out
      }
      if (hasMoreOptions === true) {
        return spriteIcons.bbq_plus
      }
      return spriteIcons.bbq
    }
    if (this.isPropertyTrue('cake') === true) {
      if (this.isPropertyTrue('run_out') === true) {
        return spriteIcons.cake_run_out
      }
      if (hasMoreOptions === true) {
        return spriteIcons.cake_plus
      }
      return spriteIcons.cake
    }

    return null
  }

  public getDetailedIconsForNoms(
    spriteIcons: any,
    spriteIconsDetailed: any,
    feature: IMapPollingPlaceFeature,
    resolution: number
  ) {
    const scaleFactor = 0.4
    const iconSize = 64
    const olStyles: Style[] = []

    if (this.hasRedCrossOfShame() === true) {
      return spriteIcons.red_cross_of_shame
    }

    // 1. Determine the primary icon to use: The green tick, plus, run out, or red cross of shame.
    //    This is used to decorate the actual lat,lon the polling place is at.
    const primaryIconName = this.getPrimaryIconName()
    const primaryIcon = spriteIconsDetailed[primaryIconName]
    primaryIcon.getImage().setAnchor([iconSize * scaleFactor, iconSize * scaleFactor])
    primaryIcon.getImage().setScale(scaleFactor)
    primaryIcon.setZIndex(0)
    olStyles.push(primaryIcon)

    // 2. Label the polling place with the name of its premises
    const fontSize = 16
    const [label, replaceCount] = stringDivider(feature.get('premises'), 16, '\n')
    const numberOfLines = replaceCount + 1
    olStyles.push(
      new Style({
        text: new Text({
          text: label,
          font: `${fontSize}px Roboto, sans-serif`,
          textAlign: 'left',
          offsetX: -(fontSize * 0.5),
          offsetY: replaceCount === 0 ? -(fontSize * 1.15) : -(fontSize * numberOfLines) + fontSize * 0.25,
          fill: new Fill({
            color: '#000',
          }),
          stroke: new Stroke({
            color: '#fff',
            width: 3,
          }),
        }),
        zIndex: 10,
      })
    )

    // 3. Create a 3x2 grid of all of the noms options available
    const spriteIconNames: string[] = this.getFoodIconNamesFromNoms().sort()

    spriteIconNames.forEach((iconName: any, index: number) => {
      const icon = spriteIconsDetailed[iconName]
      icon.getImage().setAnchor(this.getIconAnchorPosition(index, iconSize, scaleFactor))
      icon.getImage().setScale(scaleFactor)
      olStyles.push(icon)
    })

    return olStyles
  }

  public getPrimaryIconName() {
    if (this.hasRunOut() === true) {
      return 'run_out'
    }
    if (this.hasExtraNoms() === true) {
      return 'plus'
    }
    return 'tick'
  }

  // eslint-disable-next-line class-methods-use-this
  public getIconAnchorPosition(position: number, iconSize: number, scaleFactor: number) {
    const columnCount = 3
    const rowPosition = Math.floor(position / columnCount)
    const columnPosition = position % columnCount

    const paddingX = 18
    const paddingY = 18
    const startX = -iconSize + iconSize * scaleFactor - paddingX
    const startY = iconSize * scaleFactor

    const anchorX = startX - columnPosition * (iconSize + paddingX)
    const anchorY = startY - rowPosition * (iconSize + paddingY)

    return [anchorX, anchorY]
  }

  // eslint-disable-next-line class-methods-use-this
  private filterFalsey(noms: IMapPollingGeoJSONNoms | null) {
    // For legacy reasons the backend stores falsey values for noms.
    // e.g. {bbq: false, cake: true} only contains one piece of information
    // that we really care about: That the polling place has cake.
    // This function filters out all of these falsey values.

    if (noms === null) {
      return null
    }

    const filtered = {}
    Object.entries(noms).forEach(([name, value]: [string, boolean]) => {
      if (value !== false) {
        filtered[name] = value
      }
    })
    return filtered
  }

  private isPropertyTrue(prop: string) {
    return this.noms !== null && prop in this.noms && this.noms[prop] === true
  }

  private hasAnyPropertiesTrue(props: string[]) {
    for (const prop of props) {
      if (this.isPropertyTrue(prop) === true) {
        return true
      }
    }
    return false
  }

  private hasAllPropertiesTrue(props: string[]) {
    for (const prop of props) {
      if (this.isPropertyTrue(prop) === false) {
        return false
      }
    }
    return true
  }
}
