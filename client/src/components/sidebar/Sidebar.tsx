import SidebarButton from "@/components/sidebar/sidebar-views/SidebarButton"
import { useAppContext } from "@/context/AppContext"
import { useViews } from "@/context/ViewContext"
import useResponsive from "@/hooks/useResponsive"
import { ACTIVITY_STATE } from "@/types/app"
import { VIEWS } from "@/types/view"
import cn from "classnames"
import { MdOutlineDraw } from "react-icons/md"
import { Tooltip } from 'react-tooltip'
import { useState } from 'react'
import { tooltipStyles } from "./tooltipStyles"

function Sidebar() {
    const {
        activeView,
        isSidebarOpen,
        viewComponents,
        viewIcons,
    } = useViews()
    const { activityState, setActivityState } = useAppContext()
    const { minHeightReached } = useResponsive()
    const [showTooltip, setShowTooltip] = useState(true)

    const toggleDrawing = () => {
        setActivityState(
            activityState === ACTIVITY_STATE.DRAWING
                ? ACTIVITY_STATE.CODING
                : ACTIVITY_STATE.DRAWING
        )
    }

    return (
        <aside className="flex w-full md:h-full md:max-h-full md:min-h-full md:w-auto">
            <div
                className={cn(
                    "fixed bottom-0 left-0 z-50 flex h-[50px] w-full gap-4 self-end overflow-hidden border-t border-darkHover bg-dark p-2 md:static md:h-full md:w-[50px] md:min-w-[50px] md:flex-col md:border-r md:border-t-0 md:p-2 md:pt-4",
                    {
                        hidden: minHeightReached,
                    },
                )}
            >
                <SidebarButton
                    viewName={VIEWS.FILES}
                    icon={viewIcons[VIEWS.FILES]}
                />
                <SidebarButton
                    viewName={VIEWS.CHATS}
                    icon={viewIcons[VIEWS.CHATS]}
                />
                <SidebarButton
                    viewName={VIEWS.COPILOT}
                    icon={viewIcons[VIEWS.COPILOT]}
                />
                <SidebarButton
                    viewName={VIEWS.RUN}
                    icon={viewIcons[VIEWS.RUN]}
                />
                <SidebarButton
                    viewName={VIEWS.CLIENTS}
                    icon={viewIcons[VIEWS.CLIENTS]}
                />
                <SidebarButton
                    viewName={VIEWS.SETTINGS}
                    icon={viewIcons[VIEWS.SETTINGS]}
                />

                {/* Drawing mode toggle button */}
                <div className="flex h-fit items-center justify-center">
                    <button
                        className={cn(
                            "flex items-center justify-center rounded p-1.5 transition-colors",
                            activityState === ACTIVITY_STATE.DRAWING
                                ? "bg-primary text-black"
                                : "hover:bg-darkHover text-white"
                        )}
                        onClick={toggleDrawing}
                        onMouseEnter={() => setShowTooltip(true)}
                        data-tooltip-id="activity-state-tooltip"
                        data-tooltip-content={
                            activityState === ACTIVITY_STATE.DRAWING
                                ? "Switch to Editor"
                                : "Switch to Drawing"
                        }
                    >
                        <MdOutlineDraw size={30} />
                    </button>
                    {showTooltip && (
                        <Tooltip
                            id="activity-state-tooltip"
                            place="right"
                            offset={15}
                            className="!z-50"
                            style={tooltipStyles}
                            noArrow={false}
                            positionStrategy="fixed"
                            float={true}
                        />
                    )}
                </div>
            </div>
            <div
                className="absolute left-0 top-0 z-20 w-full flex-col bg-dark md:static md:min-w-[300px]"
                style={isSidebarOpen ? {} : { display: "none" }}
            >
                {/* Render the active view component */}
                {viewComponents[activeView]}
            </div>
        </aside>
    )
}

export default Sidebar
