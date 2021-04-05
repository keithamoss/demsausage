import * as React from "react"
import "./SausageLoader.css"

interface IProps {}

class SausageLoader extends React.PureComponent<IProps, {}> {
    private intervalId: number
    private icons = ["bbq", "cake", "coffee", "bacon_and_eggs", "vego"]
    private messages = ["Sizzling snags", "Icing the cupcakes", "Grinding the beans", "Lighting the BBQ", "Shearing the kale"]

    constructor(props: IProps) {
        super(props)

        this.intervalId = window.setInterval(
            (icons: string[], messages: string[]) => {
                const iconEl = document.getElementById("loaderImage")
                if (iconEl !== null) {
                    const iconIdx = icons.findIndex((icon: string) => `sprite_05-${icon}` === iconEl.className)
                    let nextIdx = 0
                    if (iconIdx < icons.length - 1) {
                        nextIdx = iconIdx + 1
                    }
                    iconEl.className = `sprite_05-${icons[nextIdx]}`
                }
                const messageEl = document.getElementById("loaderMessage")
                if (messageEl !== null) {
                    const messageIdx = messages.findIndex((message: string) => `${message}...` === messageEl.innerHTML)
                    let nextIdx = 0
                    if (messageIdx < messages.length - 1) {
                        nextIdx = messageIdx + 1
                    }

                    messageEl.classList.add("fade")
                    window.setTimeout(() => {
                        messageEl.innerHTML = `${messages[nextIdx]}...`
                    }, 1000)
                    window.setTimeout(() => {
                        messageEl.classList.remove("fade")
                    }, 2000)
                }
            },
            4000,
            this.icons,
            this.messages
        )
    }

    componentWillUnmount() {
        if (this.intervalId !== undefined) {
            window.clearInterval(this.intervalId)
        }
    }

    render() {
        return (
            <div className="loader">
                <div className="image">
                    <div id="loaderImage" className="sprite_05-bbq_and_cake_tick" />
                </div>

                <span id="loaderMessage">Loading map...</span>
            </div>
        )
    }
}

export default SausageLoader
