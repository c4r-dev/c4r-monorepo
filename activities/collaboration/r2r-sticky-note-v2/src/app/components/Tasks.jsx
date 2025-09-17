"use client"
import React from 'react'
import TaskCard from './TaskCard'

const Tasks = () => {
    const [tasks, setTasks] = React.useState([])
    React.useEffect(() => {
        const loadTasks = async () => {
            const { getBasePath } = await import("@/app/utils/basePath");
            const base = getBasePath();
            const res = await fetch(`${base}/api/tasks`, {
                cache: 'no-store'
            })
            if (!res.ok) {
                return {}
            }
            const data = await res.json()
            setTasks(data)
        }
        loadTasks()
    }, [])
    return (
        <div className='grid md:grid-cols-3 gap-2'>
            {tasks.map((task) => (
                <TaskCard task={task} key={task._id} />
            ))}
        </div>
    )
}

export default Tasks
