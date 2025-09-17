"use client"
import React from 'react'
import TaskCard from './TaskCard'

const Tasks = () => {
    const [tasks, setTasks] = React.useState([])
    React.useEffect(() => {
        const loadTasks = async () => {
            const res = await fetch(`/api/tasks`, {
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