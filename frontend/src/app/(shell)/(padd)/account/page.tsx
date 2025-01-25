'use client';
import { useEffect, useState } from 'react';
import { Avatar, Button, Flex, Group, Text, Paper, Modal, TextInput, PasswordInput } from "@mantine/core";
import { IconDoorExit, IconEdit } from "@tabler/icons-react";
import { useRouter } from 'next/navigation';
import { IconEye, IconEyeOff } from '@tabler/icons-react';

export default function Page() {
    const [userInfo, setUserInfo] = useState({ email: '', username: '', password: '' });
    const [editModalOpened, setEditModalOpened] = useState(false);
    const [editedUsername, setEditedUsername] = useState('');
    const [editedEmail, setEditedEmail] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [editedPassword, setEditedPassword] = useState('');
    const [email, setEmail] = useState('');
    const router = useRouter();
    const username = sessionStorage.getItem('username');
    const pwd = sessionStorage.getItem('password') || '********';

    const fetchUserEmail=async (username: string)=>{
    try {
            const response = await fetch(`http://127.0.0.1:8000/api/getemailuser/${username}`);
            const data = await response.json();
            if (response.ok) {
                setEmail(data.email);
            } else {
                console.error('Error fetching user:', data.error);
                return null;
            }
        } catch (error) {
            console.error('Error fetching user:', error);
            return null;
        }

    }


    useEffect(() => {
        if(username){
            fetchUserEmail(username);
        }
        if (email) {
            fetchUserFromDatabase(email).then(user => {
                if (user) {
                    setUserInfo({ email: user.email, username: user.username, password: pwd });
                    setEditedUsername(user.username);
                    setEditedEmail(user.email);
                    setEditedPassword(''); 
                }
            });
        }
    }, [email]);

    const fetchUserFromDatabase = async (email: string) => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/usersInfo/${email}`);
            const data = await response.json();
      
            if (response.ok) {
                return data; 
            } else {
                console.error('Error fetching user:', data.error);
                return null;
            }
        } catch (error) {
            console.error('Error fetching user:', error);
            return null;
        }
    };


   const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    console.log('refreshToken:', refreshToken);
    if (!refreshToken) {
        console.error('No refresh token found.');
        return;
    }

    try {
        const response = await fetch('http://127.0.0.1:8000/api/logout/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (response.ok) {
            // Suppression des tokens côté client
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('access_token');

            // Affiche un message de succès (optionnel)
            console.log('Logout successful.');

            // Redirige l'utilisateur vers la page d'accueil
            router.push('/');
        } else {
            const errorData = await response.json();
            console.error('Logout failed:', errorData?.error || 'Unknown error.');
        }
    } catch (error) {
        console.error('Error during logout:', error);
    }
};


    const handleSaveChanges = async () => {
    try {
        const response = await fetch(`http://127.0.0.1:8000/api/updateuser/${userInfo.email}`, {
            method: 'PUT', // Change to PUT to match the backend
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: editedUsername,
                newEmail: editedEmail,
                newPassword: editedPassword,
            }),
        });

        if (response.ok) {
            // Update local state with the new user info
            setUserInfo({ email: editedEmail, username: editedUsername, password: editedPassword });
            setEditModalOpened(false);
        } else {
            console.error('Failed to update user information');
        }
    } catch (error) {
        console.error('Error updating user information:', error);
    }
};

    return (
        <Flex direction="column" gap={20} p="md" maw={800} mx="auto">
            {/* Header */}
            <Text size="xl" fw="bold" ta="center" mb="lg">
                Account Information
            </Text>

            {/* User Info Card */}
            <Paper withBorder p="lg" radius="md" shadow="sm">
                <Flex align="center" gap="xl">
                    {/* Avatar */}
                    <Avatar size={120} radius="xl" color="blue" src={null} alt={userInfo.username}>
                        {userInfo.username ? userInfo.username.charAt(0).toUpperCase() : 'U'}
                    </Avatar>

                    {/* User Details */}
                    <Flex direction="column" gap="sm">
                        <Text size="sm" c="dimmed">
                            Username: {userInfo.username}
                        </Text>
                        <Text size="sm" c="dimmed">
                            Email: {userInfo.email}
                        </Text>
                        <Flex align="center" gap="sm">
                <Text size="sm" c="dimmed">
                    Password: {showPassword ? userInfo.password : '********'}
                </Text>
                <Button
                    variant="subtle"
                    size="xs"
                    onClick={() => setShowPassword(!showPassword)}
                >
                    {showPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                </Button>
            </Flex>
                    </Flex>
                </Flex>
            </Paper>

            {/* Buttons */}
            <Group justify="flex-end" mt="md">
                <Button
                    leftSection={<IconEdit size="1rem" stroke={3} />}
                    variant="outline"
                    onClick={() => setEditModalOpened(true)}
                >
                    Edit
                </Button>
                <Button
                    leftSection={<IconDoorExit size="1rem" stroke={3} />}
                    color="red"
                    variant="outline"
                    onClick={handleLogout}
                >
                    Logout
                </Button>
            </Group>

            {/* Edit Modal */}
            <Modal
                opened={editModalOpened}
                onClose={() => setEditModalOpened(false)}
                title="Edit User Information"
                centered
            >
                <Flex direction="column" gap="md">
                    <TextInput
                        label="Username"
                        value={editedUsername}
                        onChange={(e) => setEditedUsername(e.target.value)}
                    />
                    <TextInput
                        label="Email"
                        value={editedEmail}
                        onChange={(e) => setEditedEmail(e.target.value)}
                    />
                    <PasswordInput
                        label="New Password"
                        value={editedPassword}
                        onChange={(e) => setEditedPassword(e.target.value)}
                        placeholder="Enter new password"
                    />
                    <Group justify="flex-end" mt="md">
                        <Button variant="outline" onClick={() => setEditModalOpened(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveChanges}>Save Changes</Button>
                    </Group>
                </Flex>
            </Modal>
        </Flex>
    );
}