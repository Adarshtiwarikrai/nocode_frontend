import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ScrollArea } from '../ui/scrollarea';
import { Badge } from '../ui/badge';
import { Icons } from '../ui/icons';
import { cn } from '../../lib/utils';
import { useTools } from '../../hooks/tool';
import useUserStore from '../../store/user';
import { useToast } from '../../hooks/toast';
const BACKEND_URL =
    (typeof window !== 'undefined' && window.__BACKEND_URL__) ||
    'http://localhost:8000/v1'

export const ToolParameterConfig = ({
    tool,
    isOpen,
    onClose,
    onSave,
    initialValues = {},
    nodeId = 'default',
    nodeName = 'default',
    agentId,
}) => {
    const [textconfig, settextconfig] = useState({ text: '' })
    const [apiConfig, setApiConfig] = useState({ method: 'GET', url: '', parameters: [] });
    const [conditionConfig, setConditionConfig] = useState({
        ifCondition: '',
        ifNode: null,
        elseIfConditions: [],
        elseNode: null,
    });
}