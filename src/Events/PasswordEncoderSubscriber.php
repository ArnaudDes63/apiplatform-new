<?php

namespace App\Events;

use App\Entity\User;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\HttpKernel\Event\ViewEvent;
use ApiPlatform\Symfony\EventListener\EventPriorities;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class PasswordEncoderSubscriber implements EventSubscriberInterface {

    /** @var UserPasswordHasherInterface */
    private $encoder;

    public function __construct(UserPasswordHasherInterface $encoder) {

        $this->encoder = $encoder;


    }

    public static function getSubscribedEvents(){

        return [
            KernelEvents::VIEW => ['hashPassword', EventPriorities::PRE_WRITE]
        ];
    }

    public function hashPassword(ViewEvent $event) {

       $user =  $event->getControllerResult();
       
       $method = $event->getRequest()->getMethod(); // POST , GET , PUT ...
       
       if($user instanceof User && $method === "POST") {
           $hash = $this->encoder->hashPassword($user, $user->getPassword());
           $user->setPassword($hash);
           
       }
    }
    
}