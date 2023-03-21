<?php 

namespace App\Events;

use App\Entity\Customer;
use Symfony\Component\Security\Core\Security;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\HttpKernel\Event\ViewEvent;
use ApiPlatform\Symfony\EventListener\EventPriorities;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class CustomerUserSubscriber implements EventSubscriberInterface {

    private $security;

    public function __construct(Security $security) {
        $this->security = $security;
    }

    public static function getSubscribedEvents() {
        return [
            KernelEvents::VIEW => ['setUserForCustomer', EventPriorities::PRE_VALIDATE]

        ];
    }

    public function setUserForCustomer(ViewEvent $event )  {

        $customer = $event->getControllerResult();
        $method = $event->getRequest()->getMethod();

        if($customer instanceof Customer && $method === "POST" ){
            //Chopper l utilisateur actuellement connecter
            $user = $this->security->getUser();            
            //Assigner l utilisateur au Customer qu on est en trein de creer 
            $customer->setUser($user);
            
        }
    }    
}